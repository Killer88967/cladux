import { Avatar, AvatarFallback, AvatarImage } from "@cladux/ui";

export default function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" className="grayscale" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}
