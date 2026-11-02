"use client";

import { PaperclipIcon, XIcon } from "lucide-react";
import { Button, FileUpload, FileUploadList, FileUploadTrigger, formatBytes } from "@cladux/ui";

export default function FileUploadButton() {
  return (
    <FileUpload multiple={false} accept=".pdf,.doc,.docx" className="max-w-sm items-start">
      <FileUploadTrigger asChild>
        <Button variant="outline">
          <PaperclipIcon />
          Attach résumé
        </Button>
      </FileUploadTrigger>
      <FileUploadList className="w-full">
        {(file, { remove }) => (
          <div className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm">
            <span className="min-w-0 flex-1 truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
            <Button variant="ghost" size="icon-xs" aria-label={`Remove ${file.name}`} onClick={remove}>
              <XIcon />
            </Button>
          </div>
        )}
      </FileUploadList>
    </FileUpload>
  );
}
