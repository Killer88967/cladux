import { ImageCropper } from "@cladux/ui";

export default function ImageCropperDemo() {
  return (
    <ImageCropper
      className="max-w-lg"
      src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&auto=format&fit=crop&q=80"
      alt="An office with plants and long desks"
      aspect={4 / 3}
      crossOrigin="anonymous"
    />
  );
}
