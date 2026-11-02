"use client";

import { HeartIcon } from "lucide-react";
import { Rating } from "@cladux/ui";

export default function RatingCustomIcon() {
  return (
    <Rating
      defaultValue={2}
      max={4}
      icon={<HeartIcon />}
      className="text-rose-500"
      getLabel={(value, max) => `${value} of ${max} hearts`}
      aria-label="How much did you like it?"
    />
  );
}
