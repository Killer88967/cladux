"use client";

import * as React from "react";
import { cn } from "@cladux/utils";
import { Slot } from "radix-ui";

import { useControllableState } from "../hooks/use-controllable-state";

interface FileUploadRejection {
  file: File;
  reason: "type" | "size" | "count";
  message: string;
}

interface FileUploadContextValue {
  files: File[];
  add: (incoming: FileList | File[]) => void;
  remove: (file: File) => void;
  clear: () => void;
  open: () => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  disabled: boolean;
  invalid: boolean;
  inputId: string;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(null);

/** The files and actions, for building your own list or buttons. */
function useFileUpload() {
  const context = React.useContext(FileUploadContext);
  if (!context) throw new Error("useFileUpload must be used inside <FileUpload>.");
  return context;
}

/** 1536 -> "1.5 KB" */
function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const n = bytes / 1024 ** i;
  return `${i === 0 ? n : n.toFixed(decimals).replace(/\.0+$/, "")} ${units[i]}`;
}

/** Same rules as the input's `accept`: ".pdf", "image/*", "image/png". */
function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith(".")
        ? name.endsWith(rule)
        : rule.endsWith("/*")
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    );
}

function FileUpload({
  className,
  value,
  defaultValue = [],
  onValueChange,
  onReject,
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  disabled = false,
  invalid = false,
  name,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  /** Called with the files that were turned away and why. */
  onReject?: (rejections: FileUploadRejection[]) => void;
  /** Like the input's accept: ".pdf,image/*". Dropped files are checked too. */
  accept?: string;
  /** In bytes. */
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Submits the files with a native form. */
  name?: string;
}) {
  const [files, setFiles] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const limit = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1;

  // Mirror the files into the hidden input so a native <form> submits them.
  React.useEffect(() => {
    const input = inputRef.current;
    if (!input || !name || typeof DataTransfer === "undefined") return;
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
  }, [files, name]);

  const context = React.useMemo<FileUploadContextValue>(
    () => ({
      files,
      dragging,
      setDragging,
      disabled,
      invalid,
      inputId,
      open: () => inputRef.current?.click(),
      clear: () => setFiles([]),
      remove: (file) => setFiles((prev) => prev.filter((f) => f !== file)),
      add: (incoming) => {
        const accepted: File[] = [];
        const rejected: FileUploadRejection[] = [];
        // A single-file upload replaces the file instead of filling up.
        const base = limit === 1 ? [] : files;
        for (const file of Array.from(incoming)) {
          if (!matchesAccept(file, accept)) {
            rejected.push({ file, reason: "type", message: `${file.name} isn't an accepted type.` });
          } else if (maxSize !== undefined && file.size > maxSize) {
            rejected.push({
              file,
              reason: "size",
              message: `${file.name} is larger than ${formatBytes(maxSize)}.`,
            });
          } else if (base.length + accepted.length >= limit) {
            rejected.push({
              file,
              reason: "count",
              message: `You can add up to ${limit} file${limit === 1 ? "" : "s"}.`,
            });
          } else if (
            !base.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
          ) {
            accepted.push(file);
          }
        }
        if (accepted.length) setFiles([...base, ...accepted]);
        if (rejected.length) onReject?.(rejected);
      },
    }),
    [files, dragging, disabled, invalid, inputId, limit, accept, maxSize, setFiles, onReject],
  );

  return (
    <FileUploadContext.Provider value={context}>
      <div
        data-slot="file-upload"
        data-disabled={disabled || undefined}
        className={cn("flex w-full min-w-0 flex-col gap-3", className)}
        {...props}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          name={name}
          accept={accept}
          multiple={limit > 1}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) context.add(e.target.files);
            // Allow picking the same file again after removing it.
            if (!name) e.target.value = "";
          }}
        />
        {children}
      </div>
    </FileUploadContext.Provider>
  );
}

function FileUploadDropzone({
  className,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<"div">) {
  const { add, open, dragging, setDragging, disabled, invalid } = useFileUpload();
  // dragenter/dragleave fire for every child, so count them.
  const depth = React.useRef(0);

  return (
    <div
      data-slot="file-upload-dropzone"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || undefined}
      data-dragging={dragging || undefined}
      onClick={(e) => {
        onClick?.(e);
        // Let buttons and links inside the zone do their own thing.
        if (!e.defaultPrevented && !(e.target as HTMLElement).closest("button,a,input")) open();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          open();
        }
      }}
      onDragEnter={(e) => {
        if (disabled || !e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (disabled || !e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        add(e.dataTransfer.files);
      }}
      className={cn(
        "flex w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input p-6 text-center text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-dragging:border-ring data-dragging:bg-muted/50 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function FileUploadIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="file-upload-icon"
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    />
  );
}

function FileUploadTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="file-upload-title" className={cn("font-medium", className)} {...props} />;
}

function FileUploadDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="file-upload-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

/** Opens the file dialog. Use asChild to make any button do it. */
function FileUploadTrigger({
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { open, disabled } = useFileUpload();
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="file-upload-trigger"
      type={asChild ? undefined : "button"}
      disabled={disabled}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          e.stopPropagation();
          open();
        }
      }}
      {...props}
    />
  );
}

/** Renders each file with your own markup, e.g. an Attachment. */
function FileUploadList({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"ul">, "children"> & {
  children: (file: File, actions: { remove: () => void }) => React.ReactNode;
}) {
  const { files, remove } = useFileUpload();
  if (!files.length) return null;
  return (
    <ul
      data-slot="file-upload-list"
      aria-label="Selected files"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {files.map((file) => (
        <li key={`${file.name}-${file.size}-${file.lastModified}`} className="min-w-0">
          {children(file, { remove: () => remove(file) })}
        </li>
      ))}
    </ul>
  );
}

/** An object URL for previewing an image, revoked when the file changes or unmounts. */
function useFilePreview(file: File | null | undefined) {
  const [url, setUrl] = React.useState<string>();
  React.useEffect(() => {
    if (!file || !file.type.startsWith("image/")) return setUrl(undefined);
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

export {
  FileUpload,
  FileUploadDescription,
  FileUploadDropzone,
  FileUploadIcon,
  FileUploadList,
  FileUploadTitle,
  FileUploadTrigger,
  formatBytes,
  useFilePreview,
  useFileUpload,
};
export type { FileUploadRejection };
