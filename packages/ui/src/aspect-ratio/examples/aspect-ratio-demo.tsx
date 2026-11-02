import Image from "next/image";
import { AspectRatio } from "@cladux/ui";

export default function AspectRatioDemo() {
  return (
    <div className="w-full max-w-sm">
      <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted">
        <Image
          src="https://avatar.vercel.sh/shadcn1"
          alt="Photo"
          fill
          sizes="384px"
          className="w-full rounded-lg object-cover grayscale dark:brightness-20"
        />
      </AspectRatio>
    </div>
  );
}
