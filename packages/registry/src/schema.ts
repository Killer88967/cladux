import { Validator, type OutputUnit, type Schema } from "@cfworker/json-schema";
// The schemas the site publishes at /schema, bundled in so validation works offline.
import configSchema from "./schemas/cl.json" with { type: "json" };
import indexSchema from "./schemas/registry.json" with { type: "json" };
import itemSchema from "./schemas/registry-item.json" with { type: "json" };
import sourceSchema from "./schemas/cl-registry.json" with { type: "json" };

const configValidator = new Validator(configSchema as Schema, "2020-12", false);
const itemValidator = new Validator(itemSchema as Schema, "2020-12", false);
const sourceValidator = new Validator(sourceSchema as Schema, "2020-12", false);
const indexValidator = new Validator(indexSchema as Schema, "2020-12", false);
indexValidator.addSchema(itemSchema as Schema);
sourceValidator.addSchema(itemSchema as Schema);

// Errors that only say "something inside didn't match"; the one inside says what.
const WRAPPERS = new Set(["properties", "items", "prefixItems", "$ref", "allOf", "false"]);

/** "#/files/0/path" -> "files[0].path" */
const where = (location: string) =>
  location
    .replace(/^#\/?/, "")
    .replace(/\/(\d+)/g, "[$1]")
    .replaceAll("/", ".") || "the file";

/** A message a person can act on, for one schema error. */
function explain(unit: OutputUnit) {
  const at = where(unit.instanceLocation);
  const quoted = unit.error.match(/"([^"]+)"/)?.[1];
  switch (unit.keyword) {
    case "required":
      return `${at === "the file" ? "" : `${at}: `}missing "${quoted}"`;
    case "additionalProperties":
      return `${at === "the file" ? "" : `${at}: `}"${quoted}" isn't a known field`;
    case "enum":
      return `${at} must be one of ${unit.error.slice(unit.error.indexOf("[") + 1, -2).replaceAll(",", ", ")}`;
    case "type":
      return `${at} must be ${unit.error.match(/Expected "(\w+)"/)?.[1] ?? "a different type"}`;
    case "propertyNames":
      return `${at}: "${quoted}" must start with @, such as @acme`;
    case "anyOf":
      return /^registries\./.test(at)
        ? `${at} must be a URL or folder, or { "url": ..., "headers": { ... } }`
        : `${at} must be a file path, or { "path": ..., "type": ... }`;
    case "minItems":
    case "minLength":
      return `${at} can't be empty`;
    case "uniqueItems":
      return `${at} lists the same thing twice`;
    case "pattern":
      if (/(^|\.)name$|registryDependencies\[/.test(at))
        return `${at} must be lowercase words joined by dashes, such as date-picker`;
      if (/\.path$/.test(at))
        return `${at} must be a path inside its folder, without a leading / or ..`;
      if (/dependencies\[/.test(at)) return `${at} must be an npm package, such as clsx@^2.1.1`;
      if (/^aliases\./.test(at)) return `${at} must be an import path, such as @/components/cl`;
      return `${at} isn't in the expected format`;
    default:
      return `${at}: ${unit.error}`;
  }
}

function check(validator: Validator, data: unknown) {
  const errors = validator.validate(data).errors;
  const anyOf = errors.filter((u) => u.keyword === "anyOf").map((u) => u.instanceLocation);
  const names = errors.filter((u) => u.keyword === "propertyNames").map((u) => u.instanceLocation);
  const under = (unit: OutputUnit) => {
    const at = unit.instanceLocation;
    const key = `${at}/${unit.error.match(/"([^"]+)"/)?.[1]}`;
    return (
      anyOf.some((l) => (at === l && unit.keyword !== "anyOf") || at.startsWith(`${l}/`)) ||
      (unit.keyword === "additionalProperties" && anyOf.includes(key)) ||
      names.some((l) => at.startsWith(`${l}/`))
    );
  };
  return errors.filter((unit) => !WRAPPERS.has(unit.keyword) && !under(unit)).map(explain);
}

/** Problems with a cl.json, as sentences. Empty when it's valid. */
export const configIssues = (data: unknown) => check(configValidator, data);
/** Problems with a registry's index.json. */
export const indexIssues = (data: unknown) => check(indexValidator, data);
/** Problems with one registry item file. */
export const itemIssues = (data: unknown) => check(itemValidator, data);
/** Problems with a cl-registry.json, the source `cladux build` reads. */
export const sourceIssues = (data: unknown) => check(sourceValidator, data);
