import { Card, CardContent, CardHeader, CardTitle, Masonry } from "@cladux/ui";

const notes = [
  { title: "Groceries", body: "Oat milk, lemons, basil, the good bread." },
  {
    title: "Book club",
    body: "Finish chapters 9 to 12 before Thursday. Bring the snacks this time, and remember to ask Sam about the sequel.",
  },
  { title: "Wi-Fi", body: "Network: Studio. Password is on the fridge." },
  {
    title: "Weekend",
    body: "Hike if it's sunny, the museum if it rains. Either way, dinner at the new ramen place on Saturday night.",
  },
  { title: "Ideas", body: "A dark mode for the recipe app. Offline sync. Shared lists." },
  { title: "Call back", body: "Dentist, before 5." },
  {
    title: "Garden",
    body: "Water the tomatoes every morning. Move the basil into the sun. The mint is taking over again, so cut it back hard.",
  },
  { title: "Gift ideas", body: "A film camera, a good notebook, concert tickets." },
];

export default function MasonryDemo() {
  return (
    <Masonry columnWidth={200} gap={12} className="max-w-3xl">
      {notes.map((note) => (
        <Card key={note.title} size="sm">
          <CardHeader>
            <CardTitle>{note.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{note.body}</CardContent>
        </Card>
      ))}
    </Masonry>
  );
}
