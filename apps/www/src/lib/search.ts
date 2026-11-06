/** One thing the search box can find. `parent` is the page a section is on. */
export interface SearchEntry {
  group: string;
  title: string;
  href: string;
  parent?: string;
  text?: string;
}

/**
 * The entries that have every word of the query, best first: a word in the
 * title counts most, then in the page it's on, then in its text. Pages come
 * before their own sections.
 */
export function search(entries: SearchEntry[], query: string, limit = 40) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/\s+/);
  const results: { entry: SearchEntry; score: number }[] = [];

  for (const entry of entries) {
    const title = entry.title.toLowerCase();
    const parent = entry.parent?.toLowerCase() ?? "";
    const text = entry.text?.toLowerCase() ?? "";
    let score = 0;
    for (const word of words) {
      if (title.startsWith(word) || title.includes(`  ${word}`)) score += 10;
      else if (title.includes(word)) score += 6;
      else if (parent.includes(word)) score += 4;
      else if (text.includes(word)) score += 1;
      else {
        score = -1;
        break;
      }
    }
    if (score < 0) continue;
    if (title === q) score += 30;
    else if (title.startsWith(q)) score += 15;
    if (!entry.parent) score += 3;
    results.push({ entry, score });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry);
}
