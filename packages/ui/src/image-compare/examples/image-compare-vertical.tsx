import { ImageCompare } from "@cladux/ui";

const photo =
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&auto=format&fit=crop&q=80";

export default function ImageCompareVertical() {
  return (
    <ImageCompare
      orientation="vertical"
      defaultValue={40}
      className="aspect-square w-full max-w-sm"
      beforeLabel="Blurred"
      afterLabel="Sharp"
      before={<img src={photo} alt="A meeting room, blurred" className="blur-sm" />}
      after={<img src={photo} alt="The same meeting room, sharp" />}
    />
  );
}
