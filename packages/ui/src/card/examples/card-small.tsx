import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cladux/ui";

export default function CardSmall() {
  return (
    <Card size="sm" className="w-full max-w-xs">
      <CardHeader>
        <CardTitle>Small Card</CardTitle>
        <CardDescription>Tighter spacing with size="sm".</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Good for dense dashboards and lists.</p>
      </CardContent>
    </Card>
  );
}
