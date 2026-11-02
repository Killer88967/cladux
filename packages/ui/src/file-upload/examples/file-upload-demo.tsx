"use client";

import { FileTextIcon, UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  FileUpload,
  FileUploadDescription,
  FileUploadDropzone,
  FileUploadIcon,
  FileUploadList,
  FileUploadTitle,
  formatBytes,
} from "@cladux/ui";

export default function FileUploadDemo() {
  return (
    <FileUpload
      className="max-w-md"
      maxFiles={4}
      maxSize={5 * 1024 * 1024}
      onReject={(rejections) => toast.error(rejections[0]!.message)}
    >
      <FileUploadDropzone>
        <FileUploadIcon>
          <UploadIcon />
        </FileUploadIcon>
        <FileUploadTitle>Drop files here or click to browse</FileUploadTitle>
        <FileUploadDescription>Up to 4 files, 5 MB each</FileUploadDescription>
      </FileUploadDropzone>
      <FileUploadList>
        {(file, { remove }) => (
          <Attachment className="w-full">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.name}</AttachmentTitle>
              <AttachmentDescription>{formatBytes(file.size)}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label={`Remove ${file.name}`} onClick={remove}>
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        )}
      </FileUploadList>
    </FileUpload>
  );
}
