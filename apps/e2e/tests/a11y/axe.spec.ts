import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { isKnown } from "./known";
import { PAGES } from "./pages";

// WCAG 2.2 A and AA, what most accessibility laws ask for.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const path of PAGES) {
  test(path, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    // Colors that fade when the theme changes would be measured halfway.
    await page.addStyleTag({
      content:
        "*, *::before, *::after { transition: none !important; animation: none !important; }",
    });

    const problems: string[] = [];
    for (const theme of ["light", "dark"] as const) {
      if (theme === "dark") {
        await page.evaluate(() => {
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";
        });
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
      }
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const v of violations) {
        for (const node of v.nodes.filter((n) => !isKnown(v.id, path, n))) {
          problems.push(
            `[${theme}] ${v.id}: ${v.help}\n    at ${node.target.join(" ")}\n    ${node.failureSummary?.split("\n").slice(1).join(" ").trim()}\n    ${v.helpUrl}`,
          );
        }
      }
    }
    expect(problems, `\n${problems.join("\n\n")}\n`).toEqual([]);
  });
}
