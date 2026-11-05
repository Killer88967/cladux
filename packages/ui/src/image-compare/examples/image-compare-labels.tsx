import { ImageCompare } from "@cladux/ui";

const photo =
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80";

export default function ImageCompareLabels() {
  return (
    <ImageCompare
      className="aspect-video w-full max-w-xl"
      beforeLabel="Before"
      afterLabel="After"
      before={
        <img
          src={photo}
          alt="A workspace, washed out"
          className="brightness-125 contrast-75 saturate-50"
        />
      }
      after={<img src={photo} alt="The same workspace, color corrected" />}
    />
  );
}
