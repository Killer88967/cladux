import { Masonry } from "@cladux/ui";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=480`;
const workspace = photo("photo-1497366754035-f200968a6e72");
const desk = photo("photo-1497215728101-856f4ea42174");
const office = photo("photo-1497366811353-6870744d04b2");

// The same three photos, cropped to different shapes.
const photos = [
  { src: workspace, ratio: 4 / 3, alt: "Workspace" },
  { src: desk, ratio: 3 / 4, alt: "Desk" },
  { src: office, ratio: 1, alt: "Office" },
  { src: desk, ratio: 16 / 9, alt: "Desk" },
  { src: office, ratio: 2 / 3, alt: "Office" },
  { src: workspace, ratio: 4 / 3, alt: "Workspace" },
  { src: office, ratio: 3 / 4, alt: "Office" },
  { src: workspace, ratio: 1, alt: "Workspace" },
  { src: desk, ratio: 16 / 9, alt: "Desk" },
];

export default function MasonryImages() {
  return (
    <Masonry columnWidth={160} gap={8} className="max-w-3xl">
      {photos.map((p, i) => (
        <img
          key={i}
          src={`${p.src}&h=${Math.round(480 / p.ratio)}`}
          alt={p.alt}
          loading="lazy"
          // A size before it loads, so nothing jumps when it does.
          style={{ aspectRatio: p.ratio }}
          className="w-full rounded-lg bg-muted object-cover"
        />
      ))}
    </Masonry>
  );
}
