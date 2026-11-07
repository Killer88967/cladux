"use client";

import * as React from "react";
import { Badge, MentionInput, type MentionItem } from "@cladux/ui";

const people: MentionItem[] = [
  { id: "1", label: "Ada Lovelace", description: "ada@example.com" },
  { id: "2", label: "Alan Turing", description: "alan@example.com" },
  { id: "3", label: "Barbara Liskov", description: "barbara@example.com" },
  { id: "4", label: "Donald Knuth", description: "don@example.com" },
  { id: "5", label: "Edsger Dijkstra", description: "edsger@example.com" },
  { id: "6", label: "Frances Allen", description: "frances@example.com" },
  { id: "7", label: "Grace Hopper", description: "grace@example.com" },
  { id: "8", label: "Ken Thompson", description: "ken@example.com" },
  { id: "9", label: "Linus Torvalds", description: "linus@example.com" },
];

/** Stands in for a request to your server. */
async function searchPeople(query: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const q = query.toLowerCase();
  return people.filter((p) => p.label.toLowerCase().includes(q));
}

export default function MentionInputAsync() {
  const [mentions, setMentions] = React.useState<MentionItem[]>([]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <MentionInput
        items={searchPeople}
        onMentionsChange={setMentions}
        defaultValue="Can someone review this? "
        placeholder="Type @ to search people"
      />
      <div className="flex min-h-6 flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {mentions.length ? (
          <>
            Notifying
            {mentions.map((m) => (
              <Badge key={m.id} variant="secondary">
                {m.label}
              </Badge>
            ))}
          </>
        ) : (
          "Nobody mentioned yet."
        )}
      </div>
    </div>
  );
}
