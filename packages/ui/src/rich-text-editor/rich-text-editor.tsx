"use client";

import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { type AnyExtension } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
// ProseMirror, which Tiptap needs installed next to it.
import type { EditorView } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
  Redo2Icon,
  SquareCodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import * as React from "react";
import { cn } from "@cladux/utils";

import { Button } from "../button/button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { Separator } from "../separator/separator";
import { Toggle } from "../toggle/toggle";

const RichTextEditorContext = React.createContext<Editor | null>(null);

/** The Tiptap editor, for building your own controls. Null until it mounts. */
function useRichTextEditor() {
  return React.useContext(RichTextEditorContext);
}

interface RichTextEditorProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> {
  /** HTML. Changing it from outside replaces the content. */
  value?: string;
  defaultValue?: string;
  /** Called with HTML on every change. The editor has getJSON() and getText() too. */
  onValueChange?: (html: string, editor: Editor) => void;
  placeholder?: string;
  editable?: boolean;
  autofocus?: boolean;
  /** Extra Tiptap extensions, added after StarterKit and Placeholder. */
  extensions?: AnyExtension[];
  /** Defaults to a toolbar and the content. */
  children?: React.ReactNode;
}

function RichTextEditor(props: RichTextEditorProps) {
  // Tiptap creates the editor with random ids, which Next.js won't prerender (and the
  // server can't render an editor anyway). Until the browser takes over, the frame
  // and toolbar render without an editor, so the layout doesn't jump.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted ? <EditorHost {...props} /> : <EditorFrame {...props} editor={null} />;
}

function EditorHost({
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Write something…",
  editable = true,
  autofocus = false,
  extensions = [],
  ...props
}: RichTextEditorProps) {
  const onChange = React.useRef(onValueChange);
  onChange.current = onValueChange;

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    autofocus,
    content: value ?? defaultValue,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      ...extensions,
    ],
    onUpdate: ({ editor }) => onChange.current?.(editor.getHTML(), editor),
  });

  // Follow a controlled value that changed outside the editor.
  React.useEffect(() => {
    if (!editor || value === undefined || value === editor.getHTML()) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  React.useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  return <EditorFrame {...props} editable={editable} editor={editor} />;
}

function EditorFrame({
  className,
  children,
  editable = true,
  editor,
  // Editor options are handled by EditorHost; keep them off the div.
  value: _value,
  defaultValue: _defaultValue,
  onValueChange: _onValueChange,
  placeholder: _placeholder,
  autofocus: _autofocus,
  extensions: _extensions,
  ...props
}: RichTextEditorProps & { editor: Editor | null }) {
  return (
    <RichTextEditorContext.Provider value={editor}>
      <div
        data-slot="rich-text-editor"
        data-disabled={!editable || undefined}
        className={cn(
          "flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-input transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
          className,
        )}
        {...props}
      >
        {children ?? (
          <>
            <RichTextEditorToolbar />
            <RichTextEditorContent />
          </>
        )}
      </div>
    </RichTextEditorContext.Provider>
  );
}

function RichTextEditorContent({ className, ...props }: React.ComponentProps<"div">) {
  const editor = useRichTextEditor();
  return (
    <div
      data-slot="rich-text-editor-content"
      // Clicking the padding focuses the editor too.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          editor?.commands.focus("end");
        }
      }}
      className={cn(
        "min-h-40 flex-1 cursor-text overflow-y-auto px-3 py-2.5 text-sm leading-relaxed",
        "[&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none [&_.ProseMirror>*+*]:mt-3",
        "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:text-base [&_h3]:font-semibold",
        "[&_li+li]:mt-1 [&_li>p]:my-0 [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6",
        "[&_blockquote]:border-s-2 [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-3",
        "[&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_hr]:border-border [&_s]:text-muted-foreground",
        "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
        className,
      )}
      {...props}
    >
      {/* EditorContent makes random ids too, so it waits for the editor. */}
      {editor && <EditorContent editor={editor} />}
    </div>
  );
}

type Format =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock";

const FORMATS: Record<
  Format,
  {
    label: string;
    icon: React.ComponentType;
    shortcut?: string;
    isActive: (e: Editor) => boolean;
    run: (e: Editor) => void;
    can: (e: Editor) => boolean;
  }
> = {
  bold: {
    label: "Bold",
    icon: BoldIcon,
    shortcut: "Mod+B",
    isActive: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
    can: (e) => e.can().toggleBold(),
  },
  italic: {
    label: "Italic",
    icon: ItalicIcon,
    shortcut: "Mod+I",
    isActive: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
    can: (e) => e.can().toggleItalic(),
  },
  underline: {
    label: "Underline",
    icon: UnderlineIcon,
    shortcut: "Mod+U",
    isActive: (e) => e.isActive("underline"),
    run: (e) => e.chain().focus().toggleUnderline().run(),
    can: (e) => e.can().toggleUnderline(),
  },
  strike: {
    label: "Strikethrough",
    icon: StrikethroughIcon,
    shortcut: "Mod+Shift+S",
    isActive: (e) => e.isActive("strike"),
    run: (e) => e.chain().focus().toggleStrike().run(),
    can: (e) => e.can().toggleStrike(),
  },
  code: {
    label: "Inline code",
    icon: CodeIcon,
    shortcut: "Mod+E",
    isActive: (e) => e.isActive("code"),
    run: (e) => e.chain().focus().toggleCode().run(),
    can: (e) => e.can().toggleCode(),
  },
  heading1: {
    label: "Heading 1",
    icon: Heading1Icon,
    isActive: (e) => e.isActive("heading", { level: 1 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    can: (e) => e.can().toggleHeading({ level: 1 }),
  },
  heading2: {
    label: "Heading 2",
    icon: Heading2Icon,
    isActive: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    can: (e) => e.can().toggleHeading({ level: 2 }),
  },
  heading3: {
    label: "Heading 3",
    icon: Heading3Icon,
    isActive: (e) => e.isActive("heading", { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    can: (e) => e.can().toggleHeading({ level: 3 }),
  },
  bulletList: {
    label: "Bulleted list",
    icon: ListIcon,
    isActive: (e) => e.isActive("bulletList"),
    run: (e) => e.chain().focus().toggleBulletList().run(),
    can: (e) => e.can().toggleBulletList(),
  },
  orderedList: {
    label: "Numbered list",
    icon: ListOrderedIcon,
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    can: (e) => e.can().toggleOrderedList(),
  },
  blockquote: {
    label: "Quote",
    icon: QuoteIcon,
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
    can: (e) => e.can().toggleBlockquote(),
  },
  codeBlock: {
    label: "Code block",
    icon: SquareCodeIcon,
    isActive: (e) => e.isActive("codeBlock"),
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
    can: (e) => e.can().toggleCodeBlock(),
  },
};

function RichTextEditorToolbar({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="rich-text-editor-toolbar"
      role="toolbar"
      aria-label="Formatting"
      onKeyDown={(e) => {
        // Arrow keys move between the toolbar buttons.
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const buttons = [
          ...e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
        ];
        const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (at === -1) return;
        const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
        const step = (e.key === "ArrowRight") !== rtl ? 1 : -1;
        buttons[(at + step + buttons.length) % buttons.length]?.focus();
        e.preventDefault();
      }}
      className={cn(
        "flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 p-1",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <RichTextEditorUndo />
          <RichTextEditorRedo />
          <RichTextEditorSeparator />
          <RichTextEditorToggle format="bold" />
          <RichTextEditorToggle format="italic" />
          <RichTextEditorToggle format="underline" />
          <RichTextEditorToggle format="strike" />
          <RichTextEditorToggle format="code" />
          <RichTextEditorSeparator />
          <RichTextEditorToggle format="heading1" />
          <RichTextEditorToggle format="heading2" />
          <RichTextEditorToggle format="heading3" />
          <RichTextEditorSeparator />
          <RichTextEditorToggle format="bulletList" />
          <RichTextEditorToggle format="orderedList" />
          <RichTextEditorToggle format="blockquote" />
          <RichTextEditorToggle format="codeBlock" />
          <RichTextEditorSeparator />
          <RichTextEditorLink />
          <RichTextEditorHorizontalRule />
        </>
      )}
    </div>
  );
}

function RichTextEditorSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      orientation="vertical"
      className={cn("mx-0.5 data-[orientation=vertical]:h-4", className)}
      {...props}
    />
  );
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** A toolbar button for one format. */
function RichTextEditorToggle({
  format,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Toggle>, "pressed" | "onPressedChange"> & { format: Format }) {
  const editor = useRichTextEditor();
  const def = FORMATS[format];
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      active: e ? def.isActive(e) : false,
      can: e ? e.isEditable && def.can(e) : false,
    }),
  });
  const Icon = def.icon;
  const shortcut = def.shortcut?.replace("Mod", isMac() ? "⌘" : "Ctrl");

  return (
    <Toggle
      data-slot="rich-text-editor-toggle"
      size="sm"
      aria-label={def.label}
      title={shortcut ? `${def.label} (${shortcut})` : def.label}
      pressed={state?.active ?? false}
      disabled={!state?.can}
      onPressedChange={() => editor && def.run(editor)}
      className={cn("px-0", className)}
      {...props}
    >
      <Icon />
    </Toggle>
  );
}

function HistoryButton({ action }: { action: "undo" | "redo" }) {
  const editor = useRichTextEditor();
  const can = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? e.isEditable && e.can()[action]() : false),
  });
  const Icon = action === "undo" ? Undo2Icon : Redo2Icon;
  return (
    <Button
      data-slot={`rich-text-editor-${action}`}
      variant="ghost"
      size="icon-sm"
      aria-label={action === "undo" ? "Undo" : "Redo"}
      disabled={!can}
      onClick={() => editor?.chain().focus()[action]().run()}
    >
      <Icon />
    </Button>
  );
}

const RichTextEditorUndo = () => <HistoryButton action="undo" />;
const RichTextEditorRedo = () => <HistoryButton action="redo" />;

function RichTextEditorHorizontalRule() {
  const editor = useRichTextEditor();
  const editable = useEditorState({ editor, selector: ({ editor: e }) => !!e?.isEditable });
  return (
    <Button
      data-slot="rich-text-editor-horizontal-rule"
      variant="ghost"
      size="icon-sm"
      aria-label="Divider"
      disabled={!editable}
      onClick={() => editor?.chain().focus().setHorizontalRule().run()}
    >
      <MinusIcon />
    </Button>
  );
}

/** Add, edit or remove a link on the selection. */
function RichTextEditorLink() {
  const editor = useRichTextEditor();
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      active: !!e?.isActive("link"),
      href: (e?.getAttributes("link").href as string | undefined) ?? "",
      editable: !!e?.isEditable,
    }),
  });
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");

  // Cmd/Ctrl+K opens the link box from the editor.
  React.useEffect(() => {
    if (!editor) return;
    const dom: EditorView["dom"] = editor.view.dom;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && editor.isEditable) {
        e.preventDefault();
        setUrl((editor.getAttributes("link").href as string | undefined) ?? "");
        setOpen(true);
      }
    };
    dom.addEventListener("keydown", onKey);
    return () => dom.removeEventListener("keydown", onKey);
  }, [editor]);

  const apply = () => {
    if (!editor) return;
    const href = url.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setUrl(state?.href ?? "");
      }}
    >
      <PopoverTrigger asChild>
        <Toggle
          data-slot="rich-text-editor-link"
          size="sm"
          aria-label="Link"
          title={`Link (${isMac() ? "⌘" : "Ctrl"}+K)`}
          pressed={state?.active ?? false}
          disabled={!state?.editable}
          className="px-0"
        >
          <LinkIcon />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <input
            autoFocus
            type="url"
            inputMode="url"
            aria-label="Link address"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          />
          <div className="flex justify-end gap-2">
            {state?.active && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setUrl("");
                  editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                  setOpen(false);
                }}
              >
                Remove
              </Button>
            )}
            <Button type="submit" size="sm">
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

/** Word and character counts, updated as you type. */
function RichTextEditorFooter({ className, children, ...props }: React.ComponentProps<"div">) {
  const editor = useRichTextEditor();
  const counts = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const text = e?.getText() ?? "";
      return { words: text.trim() ? text.trim().split(/\s+/).length : 0, characters: text.length };
    },
  });
  return (
    <div
      data-slot="rich-text-editor-footer"
      className={cn(
        "flex items-center justify-between gap-2 border-t border-input px-3 py-1.5 text-xs text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <span>
            {counts?.words ?? 0} {counts?.words === 1 ? "word" : "words"}
          </span>
          <span>{counts?.characters ?? 0} characters</span>
        </>
      )}
    </div>
  );
}

export {
  RichTextEditor,
  RichTextEditorContent,
  RichTextEditorFooter,
  RichTextEditorHorizontalRule,
  RichTextEditorLink,
  RichTextEditorRedo,
  RichTextEditorSeparator,
  RichTextEditorToggle,
  RichTextEditorToolbar,
  RichTextEditorUndo,
  useRichTextEditor,
};
export type { Format as RichTextEditorFormat, RichTextEditorProps };
