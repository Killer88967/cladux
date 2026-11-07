"use client";

import * as React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ImageCropper,
  type ImageCropperHandle,
} from "@cladux/ui";

export default function ImageCropperAvatar() {
  const cropper = React.useRef<ImageCropperHandle>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const [src, setSrc] = React.useState(
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop&q=80",
  );
  const [avatar, setAvatar] = React.useState<string | null>(null);

  // A photo from the device: a blob URL, freed when another one replaces it.
  React.useEffect(() => () => URL.revokeObjectURL(src), [src]);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ImageCropper ref={cropper} src={src} shape="round" crossOrigin="anonymous" />
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          {avatar && <AvatarImage src={avatar} alt="Your new avatar" />}
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setSrc(URL.createObjectURL(file));
          }}
        />
        <Button variant="outline" className="ms-auto" onClick={() => input.current?.click()}>
          Choose photo
        </Button>
        <Button
          onClick={() => setAvatar(cropper.current?.toDataURL({ width: 256, round: true }) ?? null)}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
