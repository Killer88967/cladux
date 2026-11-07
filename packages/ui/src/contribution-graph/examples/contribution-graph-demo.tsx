import { ContributionGraph } from "@cladux/ui";

/** A year of made-up activity: quieter weekends, the odd busy day. */
function activity(days = 365) {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const idle = random() < (weekend ? 0.7 : 0.25);
    return { date, count: idle ? 0 : Math.round(random() ** 2 * 12) + 1 };
  });
}

export default function ContributionGraphDemo() {
  return <ContributionGraph data={activity()} />;
}
