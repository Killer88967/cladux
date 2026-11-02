import { Rating } from "@cladux/ui";

export default function RatingSizes() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Rating size="sm" defaultValue={4} aria-label="Small" />
      <Rating defaultValue={4} aria-label="Default" />
      <Rating size="lg" defaultValue={4} aria-label="Large" />
    </div>
  );
}
