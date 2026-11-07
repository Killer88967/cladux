import { MentionInput } from "@cladux/ui";

const team = [
  { id: "ada", label: "Ada Lovelace", description: "Engineering" },
  { id: "grace", label: "Grace Hopper", description: "Engineering" },
  { id: "alan", label: "Alan Turing", description: "Research" },
  { id: "katherine", label: "Katherine Johnson", description: "Research" },
  { id: "hedy", label: "Hedy Lamarr", description: "Design" },
  { id: "margaret", label: "Margaret Hamilton", description: "Product" },
];

export default function MentionInputDemo() {
  return (
    <MentionInput
      className="max-w-md"
      items={team}
      placeholder="Leave a comment. Type @ to mention someone."
    />
  );
}
