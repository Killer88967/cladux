"use client";

import { ImageIcon, XIcon } from "lucide-react";
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
  useFilePreview,
} from "@cladux/ui";

function ImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useFilePreview(file);
  return (
    <Attachment orientation="vertical">
      <AttachmentMedia variant="image">
        {url ? <img src={url} alt="" /> : <ImageIcon />}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>{formatBytes(file.size)}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction variant="secondary" aria-label={`Remove ${file.name}`} onClick={onRemove}>
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
}

export default function FileUploadImages() {
  return (
    <FileUpload className="max-w-md" accept="image/*" maxFiles={6}>
      <FileUploadDropzone className="p-4">
        <FileUploadIcon>
          <ImageIcon />
        </FileUploadIcon>
        <FileUploadTitle>Add photos</FileUploadTitle>
        <FileUploadDescription>PNG, JPG or GIF</FileUploadDescription>
      </FileUploadDropzone>
      <FileUploadList className="grid grid-cols-3 gap-3">
        {(file, { remove }) => <ImagePreview file={file} onRemove={remove} />}
      </FileUploadList>
    </FileUpload>
  );
}
