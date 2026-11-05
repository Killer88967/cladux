import { ImageCompare } from "@cladux/ui";

const photo =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80";

export default function ImageCompareDemo() {
  return (
    <ImageCompare
      className="aspect-video w-full max-w-xl"
      before={<img src={photo} alt="An office, in black and white" className="grayscale" />}
      after={<img src={photo} alt="The same office, in color" />}
    />
  );
}
