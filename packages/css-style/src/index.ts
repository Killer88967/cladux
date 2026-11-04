// Builds the "css" style of the registry from the Tailwind one, so both stay
// identical by construction: every Tailwind class string in a component is
// replaced with a readable `cl-*` class, and each utility's CSS is emitted for
// those classes in Tailwind's own order, so the cascade works the same way.
import { parse } from "@babel/parser";
import type * as TailwindNode from "@tailwindcss/node";
import MagicString from "magic-string";
import postcss from "postcss";
import { twMerge } from "tailwind-merge";

/** The parts of @tailwindcss/node the conversion uses, from wherever it's installed. */
export type Tailwind = Pick<
  typeof TailwindNode,
  "__unstable__loadDesignSystem" | "compile" | "optimize"
>;

export interface CssStyleOptions {
  /** The Tailwind stylesheet the components are written against (@import "tailwindcss" ...). */
  css: string;
  /** The folder its @imports resolve from. */
  base: string;
  tailwind: Tailwind;
  /** Theme variables (a :root block) that get the --cl- prefix too, and come back renamed. */
  tokens?: string;
  /** Tailwind's preflight.css, for the shared base stylesheet. Without it, base has no reset. */
  preflight?: string;
}

/** Non-utility tokens that aren't markers either (kept as-is, reported once). */
export const unknown = new Set<string>();

// Not utilities, but classes other selectors look for (group-*/name, peer-*).
const isMarker = (token: string) => /^(group|peer)(\/[\w-]+)?$/.test(token);

interface Site {
  start: number;
  end: number;
  name: string;
  utilities: string[];
  keep: string[];
  /** 1: classes passed to a component defined in the same file (they win, like twMerge). */
  tier: 0 | 1;
  /** Utilities that must win over the base classes of the same cva (emitted after them). */
  late: Set<string>;
}

/** A class string replaced as-is: merged into an earlier one, or left with only markers. */
interface Rewrite {
  start: number;
  end: number;
  text: string;
}

type Node = { type: string; start: number; end: number; [key: string]: unknown };

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/(^-|-$)/g, "");

const split = (classes: string) => classes.split(/\s+/).filter(Boolean);

/** CSS.escape, as Tailwind uses it for class selectors. */
function cssEscape(value: string) {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]!;
    const code = ch.charCodeAt(0);
    if (code === 0) out += "\uFFFD";
    else if (
      (code >= 1 && code <= 31) ||
      code === 127 ||
      (i === 0 && code >= 48 && code <= 57) ||
      (i === 1 && code >= 48 && code <= 57 && value[0] === "-")
    ) {
      out += `\\${code.toString(16)} `;
    } else if (i === 0 && ch === "-" && value.length === 1) out += `\\${ch}`;
    else if (code >= 128 || ch === "-" || ch === "_" || /[0-9A-Za-z]/.test(ch)) out += ch;
    else out += `\\${ch}`;
  }
  return out;
}

/** Splits a selector list or compound at top level (outside parens and brackets). */
function splitTop(selector: string, seps: RegExp) {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i]!;
    if (ch === "\\") {
      current += ch + (selector[++i] ?? "");
      continue;
    }
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (depth === 0 && seps.test(ch)) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
}

/**
 * True when a selector styles the element carrying `escaped` (`.x:hover`,
 * `.x:is(.group *)`), false when it reaches into others (`:is(.x > *)`, `.x svg`).
 */
function targetsSelf(selector: string, escaped: string): boolean {
  const compounds = splitTop(selector.trim(), /[\s>+~]/).filter(Boolean);
  const subject = compounds.at(-1) ?? "";
  const topLevel = subject.replace(/\((?:[^()]|\([^()]*\))*\)/g, "()");
  if (topLevel.includes(escaped)) return true;
  const inner = subject.match(/^:(?:is|where)\((.*)\)$/);
  if (inner && compounds.length === 1) {
    return splitTop(inner[1]!, /,/).every((part) => targetsSelf(part, escaped));
  }
  return false;
}

/**
 * Rules that reach into other elements (`*:w-full`, `[&_svg]:size-4`) sort after
 * plain utilities in Tailwind, so they beat a nested component's plain rules but
 * lose to its variants. Here those components live in other files, so instead of
 * relying on order, these rules get one element's worth of specificity:
 * `:is(html, html *)` matches every element and adds exactly (0,0,1).
 */
function bumpDescendantRules(css: string, escaped: string) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    rule.selectors = rule.selectors.map((sel) => {
      // Analyze with the class swapped for a placeholder: escaped names like
      // max-w-\[calc\(100\%-2rem\)\] contain parens that aren't selector syntax.
      if (!sel.includes(escaped) || targetsSelf(sel.replaceAll(escaped, ".\u00a7"), ".\u00a7")) {
        return sel;
      }
      const pseudo = sel.match(/::[\w-]+(\([^)]*\))?$/);
      return pseudo
        ? `${sel.slice(0, pseudo.index)}:is(html, html *)${pseudo[0]}`
        : `${sel}:is(html, html *)`;
    });
  });
  return root.toString();
}

interface FindOptions {
  isUtility: (tokens: string[]) => boolean[];
  marker: (token: string) => string | undefined;
  taken: Set<string>;
  avoid: string[];
}

/**
 * Finds the class strings in one component and decides a class name for each.
 * Class strings live in className="...", in cn(...) calls and in cva(...).
 * tailwind-merge's effect is applied here, at build time: unconditional class
 * strings in one cn() are merged, and cva base classes a variant would drop
 * move into the variants that keep them.
 */
function findSites(code: string, file: string, opts: FindOptions) {
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const sites: Site[] = [];
  const rewrites: Rewrite[] = [];
  const handled = new Set<Node>();
  const perElement = new Map<Node, number>();
  const fileBase = file.replace(/\.tsx?$/, "");

  // Components defined in this file: classes passed to them merge into theirs,
  // so they're emitted after the file's own. (Imported components load from an
  // earlier file, which already puts them first.)
  const localComponents = new Set<string>();
  for (const stmt of (ast.program.body as unknown as Node[]) ?? []) {
    const decl = stmt.type === "ExportNamedDeclaration" ? (stmt.declaration as Node | null) : stmt;
    if (decl?.type === "FunctionDeclaration" && decl.id) {
      const name = (decl.id as Node).name as string;
      if (/^[A-Z]/.test(name)) localComponents.add(name);
    }
  }

  const unique = (raw: string) => {
    // Never contain a substring some rule tests for, e.g. "size-" in [class*='size-'].
    let wanted = raw;
    for (const sub of opts.avoid) wanted = wanted.replaceAll(sub, sub.replace(/-$/, "_"));
    let name = wanted;
    for (let i = 2; opts.taken.has(name); i++) name = `${wanted}-${i}`;
    opts.taken.add(name);
    return name;
  };

  const addSite = (
    lit: Node,
    raw: string,
    name: string,
    tier: 0 | 1 = 0,
    late: Set<string> = new Set(),
  ) => {
    const tokens = split(raw);
    if (!tokens.length) {
      rewrites.push({ start: lit.start, end: lit.end, text: "" });
      return;
    }
    const flags = opts.isUtility(tokens);
    const utilities = tokens.filter((_, i) => flags[i]);
    for (const t of tokens.filter((_, i) => !flags[i])) {
      if (!isMarker(t)) unknown.add(`${file}: ${t}`);
    }
    // Non-utilities stay as they are; utilities other rules test for become markers.
    const markers = utilities.map(opts.marker).filter((m): m is string => !!m);
    const keep = [...tokens.filter((_, i) => !flags[i]), ...new Set(markers)];
    if (!utilities.length) {
      rewrites.push({ start: lit.start, end: lit.end, text: keep.join(" ") });
      return;
    }
    sites.push({
      start: lit.start,
      end: lit.end,
      name: unique(`cl-${name}`),
      utilities,
      keep,
      tier,
      late,
    });
  };

  const literalValue = (node: Node | null | undefined): string | undefined => {
    if (!node) return undefined;
    if (node.type === "StringLiteral") return node.value as string;
    if (node.type === "TemplateLiteral" && !(node.expressions as Node[]).length) {
      return (node.quasis as { value: { cooked: string } }[])[0]!.value.cooked;
    }
    return undefined;
  };

  /** Class strings inside a className expression or cn(...) arguments. */
  const collect = (node: Node | null | undefined, name: () => string, tier: 0 | 1) => {
    if (!node) return;
    switch (node.type) {
      case "StringLiteral":
        return addSite(node, node.value as string, name(), tier);
      case "TemplateLiteral": {
        const value = literalValue(node);
        if (value === undefined)
          throw new Error(`${file}: template literal with expressions in a class string`);
        return addSite(node, value, name(), tier);
      }
      case "TaggedTemplateExpression": {
        // String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`
        const quasi = node.quasi as Node;
        if ((quasi.expressions as Node[]).length) {
          throw new Error(`${file}: tagged template with expressions in a class string`);
        }
        return addSite(
          node,
          (quasi.quasis as { value: { raw: string } }[])[0]!.value.raw,
          name(),
          tier,
        );
      }
      case "ConditionalExpression":
        collect(node.consequent as Node, name, tier);
        return collect(node.alternate as Node, name, tier);
      case "LogicalExpression":
        collect(node.left as Node, name, tier);
        return collect(node.right as Node, name, tier);
      case "ArrayExpression":
        for (const el of node.elements as Node[]) collect(el, name, tier);
        return;
      case "TSAsExpression":
      case "ParenthesizedExpression":
        return collect(node.expression as Node, name, tier);
      case "ObjectExpression":
        // cn({ "h-2 w-2": isDot }): the keys are the class strings.
        for (const prop of node.properties as Node[]) {
          const key = prop.key as Node;
          if (key.type === "StringLiteral") addSite(key, key.value as string, name(), tier);
          else if (key.type === "Identifier") addSite(key, key.name as string, name(), tier);
        }
        return;
      case "CallExpression": {
        const callee = node.callee as Node;
        if (callee.type !== "Identifier" || callee.name !== "cn") return; // e.g. buttonVariants({ ... })
        handled.add(node);
        const args = node.arguments as Node[];
        // Unconditional strings in one cn() are merged now, exactly as twMerge would.
        const plain = args.filter((a) => literalValue(a) !== undefined);
        if (plain.length > 1) {
          addSite(plain[0]!, twMerge(...plain.map((a) => literalValue(a)!)), name(), tier);
          for (const a of plain.slice(1)) rewrites.push({ start: a.start, end: a.end, text: "" });
          for (const a of args) if (!plain.includes(a)) collect(a, name, tier);
          return;
        }
        for (const arg of args) collect(arg, name, tier);
        return;
      }
    }
  };

  /** Name for a class string on a JSX element: its data-slot, or its parent's. */
  const elementName = (el: Node, parents: Node[]) => {
    const slotOf = (opening: Node) => {
      for (const attr of opening.attributes as Node[]) {
        const n = attr.name as Node | undefined;
        if (attr.type === "JSXAttribute" && n?.name === "data-slot") {
          const v = attr.value as Node | null;
          if (v?.type === "StringLiteral") return v.value as string;
        }
      }
      return undefined;
    };
    const own = slotOf(el);
    if (own) return own;
    const tag = kebab(tagName(el));
    for (let i = parents.length - 1; i >= 0; i--) {
      const p = parents[i]!;
      if (p.type === "JSXElement") {
        const slot = slotOf(p.openingElement as Node);
        if (slot) return `${slot}__${tag}`;
      }
    }
    return `${fileBase}__${tag}`;
  };

  const tagName = (el: Node) => {
    const n = el.name as Node;
    if (n.type === "JSXIdentifier") return n.name as string;
    if (n.type === "JSXMemberExpression") return (n.property as Node).name as string;
    return "el";
  };

  const declaratorName = (parents: Node[]) => {
    for (let i = parents.length - 1; i >= 0; i--) {
      const p = parents[i]!;
      if (p.type === "VariableDeclarator" && (p.id as Node).type === "Identifier") {
        return (p.id as Node).name as string;
      }
      if (p.type === "FunctionDeclaration" && p.id) return (p.id as Node).name as string;
    }
    return fileBase;
  };

  /**
   * cva(base, { variants }) with twMerge applied: a base class some option
   * drops (text-sm under size "sm") moves into the options of that group that
   * keep it, so each combination gets exactly the classes twMerge would give.
   */
  const handleCva = (node: Node, parents: Node[]) => {
    const base = kebab(declaratorName(parents).replace(/Variants$/, ""));
    const [first, options] = node.arguments as Node[];
    const props = (options?.properties as Node[] | undefined) ?? [];
    const keyOf = (p: Node) => String((p.key as Node).name ?? (p.key as Node).value);
    const variantsProp = props.find((p) => keyOf(p) === "variants");
    const defaults = new Set(
      (
        (props.find((p) => keyOf(p) === "defaultVariants")?.value as Node | undefined)
          ?.properties as Node[] | undefined
      )?.map(keyOf) ?? [],
    );

    const groups =
      ((variantsProp?.value as Node | undefined)?.properties as Node[] | undefined) ?? [];
    const baseValue = literalValue(first);
    let baseClasses = baseValue !== undefined ? split(baseValue) : [];
    const extra = new Map<Node, string[]>();

    if (baseValue !== undefined) {
      for (const cls of [...baseClasses]) {
        const droppedBy = groups.filter((g) =>
          ((g.value as Node).properties as Node[]).some((o) => {
            const v = literalValue(o.value as Node);
            return v !== undefined && !split(twMerge(baseValue, v)).includes(cls);
          }),
        );
        if (droppedBy.length !== 1) continue; // never dropped, or by several groups: leave it
        const group = droppedBy[0]!;
        if (!defaults.has(keyOf(group))) continue; // no default: base must keep it
        baseClasses = baseClasses.filter((c) => c !== cls);
        for (const o of (group.value as Node).properties as Node[]) {
          const v = literalValue(o.value as Node);
          if (v !== undefined && split(twMerge(baseValue, v)).includes(cls)) {
            extra.set(o, [...(extra.get(o) ?? []), cls]);
          }
        }
      }
      addSite(first!, baseClasses.join(" "), base);
    } else {
      collect(first, () => base, 0);
    }

    for (const group of groups) {
      const groupName = keyOf(group);
      for (const option of (group.value as Node).properties as Node[]) {
        const optionName = keyOf(option);
        const suffix = groupName === "variant" ? optionName : `${groupName}-${optionName}`;
        const v = literalValue(option.value as Node);
        if (v !== undefined) {
          const moved = extra.get(option) ?? [];
          // Utilities that make twMerge drop a (remaining) base class must come after it.
          const remaining = baseClasses.join(" ");
          const late = new Set(
            split(v).filter((u) => split(twMerge(remaining, u)).length <= split(remaining).length),
          );
          addSite(
            option.value as Node,
            [...moved, v].join(" "),
            `${base}--${kebab(suffix)}`,
            0,
            late,
          );
        } else {
          collect(option.value as Node, () => `${base}--${kebab(suffix)}`, 0);
        }
      }
    }
    for (const prop of props) {
      if (keyOf(prop) !== "compoundVariants") continue;
      ((prop.value as Node).elements as Node[]).forEach((compound, i) => {
        for (const p of compound.properties as Node[]) {
          const k = keyOf(p);
          if (k === "class" || k === "className") {
            collect(p.value as Node, () => `${base}--compound-${i + 1}`, 0);
          }
        }
      });
    }
    handled.add(node);
  };

  const visit = (node: Node, parents: Node[]) => {
    if (node.type === "JSXAttribute" && (node.name as Node).name === "className") {
      const el = parents.at(-1)!;
      const value = node.value as Node | null;
      const expr = value?.type === "JSXExpressionContainer" ? (value.expression as Node) : value;
      const tier = localComponents.has(tagName(el)) ? 1 : 0;
      collect(
        expr,
        () => {
          const base = elementName(el, parents.slice(0, -1));
          const n = (perElement.get(el) ?? 0) + 1;
          perElement.set(el, n);
          return n === 1 ? base : `${base}--${n}`;
        },
        tier,
      );
      return;
    }

    if (node.type === "CallExpression" && !handled.has(node)) {
      const callee = node.callee as Node;
      if (callee.type === "Identifier" && callee.name === "cva") return handleCva(node, parents);
      if (callee.type === "Identifier" && callee.name === "cn") {
        return collect(node, () => `${fileBase}__${kebab(declaratorName(parents))}`, 0);
      }
    }

    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "leadingComments" || key === "trailingComments") continue;
      const value = node[key];
      const children = Array.isArray(value) ? value : [value];
      for (const child of children) {
        if (child && typeof child === "object" && typeof (child as Node).type === "string") {
          visit(child as Node, [...parents, node]);
        }
      }
    }
  };

  visit(ast.program as unknown as Node, []);
  return { sites: sites.sort((a, b) => a.start - b.start), rewrites };
}

/**
 * Some utilities look at other elements' classes: `[&>.sr-only]:w-auto` or
 * `svg:not([class*='size-'])`. The original tokens can't stay (with Tailwind on
 * the page they'd style the element), so elements get markers instead:
 * `cl-sr-only` (selectors are rewritten to match it) or `cl-size-set` (still
 * contains "size-", so substring tests behave the same).
 */
function referencedTokens(allUtilities: string[]) {
  const all = new Set(allUtilities);
  const classes = new Set<string>();
  const substrings = new Set<string>();
  for (const u of all) {
    for (const m of u.matchAll(/\[[^\]]*?\.([a-zA-Z][\w-]*)/g)) {
      if (all.has(m[1]!)) classes.add(m[1]!);
    }
    for (const m of u.matchAll(/\[class[*^]=['"]?([^'"\]]+)['"]?\]/g)) substrings.add(m[1]!);
  }
  return {
    classes,
    substrings: [...substrings],
    marker: (token: string) => {
      if (classes.has(token)) return `cl-${token}`;
      if (token.includes(":")) return undefined;
      const sub = [...substrings].find((s) => token.includes(s));
      return sub ? `cl-${sub}set` : undefined;
    },
  };
}

/** Tailwind's preflight, limited to our own elements so the rest of the page is untouched. */
function scopedPreflight(css: string) {
  const root = postcss.parse(css);
  const scope = ':where([class*="cl-"])';
  root.walkRules((rule) => {
    if (/(^|,)\s*(html|:host|body)\b/.test(rule.selector)) {
      rule.remove();
      return;
    }
    rule.selectors = rule.selectors.map((sel) => {
      if (sel === "*") return scope;
      if (sel.startsWith("::")) return `${scope}${sel}`;
      return `${scope}:where(${sel})`;
    });
  });
  root.walkAtRules("layer", (at) => {
    at.replaceWith(at.nodes ?? []);
  });
  return root.toString().trim();
}

/** Prefixes keyframe names so they can't clash with the page's own. */
function prefixKeyframes(root: postcss.Root, names: Set<string>) {
  root.walkAtRules("keyframes", (at) => {
    if (!at.params.startsWith("cl-")) at.params = `cl-${at.params}`;
  });
  root.walkDecls(/^animation(-name)?$/, (decl) => {
    decl.value = decl.value.replace(/[\w-]+/g, (word) => (names.has(word) ? `cl-${word}` : word));
  });
}

export interface CssStyleResult {
  /** Rewritten source files, keyed like the input. */
  files: Map<string, string>;
  /** Plain CSS for each source file that had class strings. */
  css: Map<string, string>;
  /** Shared CSS: Tailwind's internals (@property, keyframes) plus the scoped reset. */
  base: string;
  /** The color tokens, with the same --cl-* names. */
  tokens: string;
}

/**
 * Converts Tailwind component sources (keyed by an id, e.g. "button") into the
 * css style: sources with `cl-*` classes plus one stylesheet per source.
 */
export async function buildCssStyle(
  sources: Map<string, string>,
  { css: entry, base, tailwind, tokens = "", preflight }: CssStyleOptions,
): Promise<CssStyleResult> {
  const ds = await tailwind.__unstable__loadDesignSystem(entry, { base });
  const isUtility = (tokens: string[]) => ds.candidatesToCss(tokens).map(Boolean);

  // Pass 1: every utility in use, to learn which tokens other rules refer to.
  const firstPass: Site[] = [];
  for (const [id, code] of sources) {
    const opts = { isUtility, marker: () => undefined, taken: new Set<string>(), avoid: [] };
    firstPass.push(...findSites(code, id, opts).sites);
  }
  const referenced = referencedTokens(firstPass.flatMap((s) => s.utilities));

  // Pass 2: the real sites, with names unique across all files.
  const taken = new Set<string>();
  const files = new Map<string, string>();
  const users = new Map<string, { site: string; owner: string; tier: number }[]>();
  for (const [id, code] of sources) {
    const { sites, rewrites } = findSites(code, id, {
      isUtility,
      marker: referenced.marker,
      taken,
      avoid: referenced.substrings,
    });
    const out = new MagicString(code);
    for (const site of sites) {
      out.overwrite(site.start, site.end, JSON.stringify([site.name, ...site.keep].join(" ")));
      for (const u of site.utilities) {
        const tier = site.tier || (site.late.has(u) ? 1 : 0);
        users.set(u, [...(users.get(u) ?? []), { site: site.name, owner: id, tier }]);
      }
    }
    for (const r of rewrites) out.overwrite(r.start, r.end, JSON.stringify(r.text));
    files.set(id, out.toString());
  }

  // Each utility's rule, for our classes instead of the utility's, in Tailwind's
  // order. Within a file, "late" utilities (twMerge winners) come last.
  const utilities = [...users.keys()];
  const order = new Map(ds.getClassOrder(utilities).map(([u, o]) => [u, o ?? -1n]));
  const cmp = (a: bigint, b: bigint) => (a < b ? -1 : a > b ? 1 : 0);
  const rules = ds.candidatesToCss(utilities);
  const ruleOf = new Map(utilities.map((u, i) => [u, rules[i]!] as const));

  const entries = utilities.flatMap((u) =>
    [0, 1]
      .map((tier) => ({ u, tier, users: users.get(u)!.filter((x) => x.tier === tier) }))
      .filter((e) => e.users.length),
  );
  entries.sort((a, b) => a.tier - b.tier || cmp(order.get(a.u)!, order.get(b.u)!));

  const perOwner = new Map<string, string[]>();
  for (const { u, users: list } of entries) {
    const escaped = `.${cssEscape(u)}`;
    const css = bumpDescendantRules(ruleOf.get(u)!, escaped);
    const byOwner = new Map<string, string[]>();
    for (const x of list) byOwner.set(x.owner, [...(byOwner.get(x.owner) ?? []), x.site]);
    for (const [owner, sites] of byOwner) {
      const replacement =
        sites.length === 1 ? `.${sites[0]}` : `:is(${sites.map((s) => `.${s}`).join(", ")})`;
      let rewritten = "";
      for (let i = 0; i < css.length;) {
        const at = css.indexOf(escaped, i);
        if (at === -1) {
          rewritten += css.slice(i);
          break;
        }
        const next = css[at + escaped.length] ?? "";
        const boundary = !/[\w\\-]/.test(next);
        rewritten += css.slice(i, at) + (boundary ? replacement : escaped);
        i = at + escaped.length;
      }
      perOwner.set(owner, [...(perOwner.get(owner) ?? []), rewritten]);
    }
  }

  // Shared CSS: the theme variables in use (--spacing, --radius-md...), @property,
  // the properties fallback layer and keyframes.
  const compiled = await tailwind.compile(entry, { base, onDependency() {} });
  const sharedRoot = postcss.parse(
    tailwind.optimize(compiled.build(utilities), { minify: false }).code,
  );
  // `@import "tailwindcss"` puts the theme variables in a theme layer; take them out of it.
  sharedRoot.walkAtRules("layer", (at) => {
    if (at.params === "theme") at.replaceWith(at.nodes ?? []);
  });
  const keyframeNames = new Set<string>();
  sharedRoot.walkAtRules("keyframes", (at) => {
    keyframeNames.add(at.params);
  });
  for (const node of [...sharedRoot.nodes]) {
    const keep =
      (node.type === "atrule" && (node.name === "property" || node.name === "keyframes")) ||
      (node.type === "atrule" && node.name === "layer" && node.params === "properties") ||
      // Theme variables in use; the color tokens' own :root ships as cl-tokens.css.
      (node.type === "rule" && node.selector === ":root, :host");
    if (!keep) node.remove();
  }
  prefixKeyframes(sharedRoot, keyframeNames);

  // `.sr-only` in a selector also matches the `cl-sr-only` marker.
  const classNames = [...referenced.classes].map((c) => c.replace(/-/g, "\\-")).join("|");
  const markerRe = classNames ? new RegExp(`\\.(${classNames})(?![\\w-])`, "g") : null;

  const css = new Map<string, string>();
  for (const [owner, list] of perOwner) {
    const root = postcss.parse(tailwind.optimize(list.join("\n"), { minify: false }).code);
    if (markerRe) {
      root.walkRules((rule) => {
        rule.selector = rule.selector.replace(markerRe, (_, c: string) => `:is(.${c}, .cl-${c})`);
      });
    }
    prefixKeyframes(root, keyframeNames);
    css.set(owner, `${root.toString().trim()}\n`);
  }

  const baseCss = [
    "/* Generated from the Tailwind components. Edit packages/ui, not this file. */",
    sharedRoot.toString().trim(),
    ...(preflight
      ? ["/* Tailwind's preflight, applied only to Cladux elements. */", scopedPreflight(preflight)]
      : []),
    `:where([class*="cl-"]) {\n  border-color: var(--border);\n  outline-color: color-mix(in oklab, var(--ring) 50%, transparent);\n}`,
    `body {\n  background-color: var(--background);\n  color: var(--foreground);\n}`,
  ].join("\n\n");

  // Each file also carries the theme variables it uses (--color-amber-400...), so a
  // component added after `init` still works when init's shared file predates it.
  // :where() keeps them at zero specificity: init's copy and the user's overrides win.
  const themeDecls = new Map<string, string>();
  for (const node of sharedRoot.nodes) {
    if (node.type !== "rule" || node.selector !== ":root, :host") continue;
    node.walkDecls((decl) => {
      if (decl.prop.startsWith("--")) themeDecls.set(decl.prop, decl.value);
    });
  }
  const usedVars = (text: string) => {
    const found = new Set<string>();
    const visit = (s: string) => {
      for (const m of s.matchAll(/var\((--[\w-]+)/g)) {
        const name = m[1]!;
        if (found.has(name) || !themeDecls.has(name)) continue;
        found.add(name);
        visit(themeDecls.get(name)!);
      }
    };
    visit(text);
    return [...found].sort();
  };
  for (const [owner, text] of css) {
    const vars = usedVars(text);
    if (!vars.length) continue;
    const block = vars.map((name) => `  ${name}: ${themeDecls.get(name)};`).join("\n");
    css.set(owner, `:where(:root, :host) {\n${block}\n}\n\n${text}`);
  }

  // Namespace the theme variables (--border -> --cl-border): plain-CSS projects
  // often define generic names like --border or --accent themselves. Tailwind's
  // --tw-* and variables components set from TSX (--sidebar-width) keep theirs.
  const themeVars = new Set<string>();
  for (const m of `${tokens}\n${sharedRoot.toString()}`.matchAll(/(--[\w-]+)\s*:/g)) {
    if (!m[1]!.startsWith("--tw-")) themeVars.add(m[1]!);
  }
  // Variables a component sets inline (style={{ "--color-border": ... }}) must keep their name.
  for (const code of sources.values()) {
    for (const m of code.matchAll(/["'](--[\w-]+)["']\s*:/g)) themeVars.delete(m[1]!);
  }
  const rename = (text: string) =>
    text.replace(/(?<![\w-])--[\w-]+/g, (name) =>
      themeVars.has(name) ? `--cl-${name.slice(2)}` : name,
    );
  for (const [owner, text] of css) css.set(owner, rename(text));

  return { files, css, base: rename(`${baseCss}\n`), tokens: rename(tokens) };
}
