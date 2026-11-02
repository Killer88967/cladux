import { Rating } from "@cladux/ui";

export default function RatingReadOnly() {
  return (
    <div className="flex items-center gap-2">
      <Rating value={4.3} readOnly size="sm" aria-label="Average rating" />
      <span className="text-sm font-medium">4.3</span>
      <span className="text-sm text-muted-foreground">(1,284 reviews)</span>
    </div>
  );
}
