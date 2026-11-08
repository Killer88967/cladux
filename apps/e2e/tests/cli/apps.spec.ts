import { writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { cladux, editJson, freePort, run, serve, tempDir } from "./helpers";

// Each test makes a new app with the framework's own starter, sets it up with
// `cladux init`, adds components, builds it for production and checks them in
// a browser. They download packages, so they take a few minutes each.

const COMPONENTS = ["button", "card", "dialog", "input", "badge"];

/** A page using the added components: a card with a badge, an input and a button that opens a dialog. */
const PAGE = `import { Badge } from "@/components/cl/badge";
import { Button } from "@/components/cl/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/cl/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/cl/dialog";
import { Input } from "@/components/cl/input";

export default function Page() {
  return (
    <main style={{ padding: 40 }}>
      <Card style={{ maxWidth: 360 }}>
        <CardHeader>
          <CardTitle>
            Cladux <Badge>New</Badge>
          </CardTitle>
          <CardDescription>Installed with the CLI.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input aria-label="Name" placeholder="Your name" />
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hello</DialogTitle>
                <DialogDescription>From a fresh app.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  );
}
`;

/** The components render with the theme's styles, and the dialog works. */
async function check(page: Page, url: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);

  const button = page.getByRole("button", { name: "Open dialog" });
  await expect(button).toBeVisible();
  const style = await button.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      background: s.backgroundColor,
      radius: s.borderRadius,
      height: el.getBoundingClientRect().height,
    };
  });
  // Styled: a filled, rounded button of the usual height, not a bare browser button.
  expect(style.background).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  expect(parseFloat(style.radius)).toBeGreaterThan(0);
  expect(style.height).toBeGreaterThanOrEqual(28);

  // The card has its rounded corners from the theme, and the badge is there.
  const card = page.locator("[data-slot='card']");
  expect(
    parseFloat(await card.evaluate((el) => getComputedStyle(el).borderRadius)),
  ).toBeGreaterThan(4);
  await expect(page.locator("[data-slot='badge']")).toHaveText("New");

  await button.click();
  const dialog = page.getByRole("dialog", { name: "Hello" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
}

test("a Next.js app with the Tailwind style", async ({ page }) => {
  const dir = await tempDir();
  await run(
    "npx",
    [
      "--yes",
      "create-next-app@latest",
      "app",
      "--yes",
      "--ts",
      "--tailwind",
      "--app",
      "--src-dir",
      "--use-npm",
      "--disable-git",
      "--no-agent-feedback",
    ],
    dir,
  );
  const app = path.join(dir, "app");
  await cladux(app, "init", "--style", "tailwind");
  await cladux(app, "add", ...COMPONENTS);
  await writeFile(path.join(app, "src/app/page.tsx"), PAGE);
  // The starter's layout loads fonts from Google, which the test doesn't need.
  await writeFile(
    path.join(app, "src/app/layout.tsx"),
    `import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
  );
  await run("npm", ["run", "build"], app);

  const port = await freePort();
  const server = await serve(
    "npx",
    ["next", "start", "-p", String(port)],
    app,
    `http://localhost:${port}`,
  );
  try {
    await check(page, `http://localhost:${port}`);
  } finally {
    server.kill();
  }
});

test("a Vite app with the plain CSS style", async ({ page }) => {
  const dir = await tempDir();
  await run(
    "npx",
    ["--yes", "create-vite@latest", "app", "--template", "react-ts", "--no-interactive"],
    dir,
  );
  const app = path.join(dir, "app");
  await run("npm", ["install"], app);

  // The @/ import alias, which `cladux init` asks for (as shadcn/ui does).
  await editJson(path.join(app, "tsconfig.app.json"), (json) => {
    json.compilerOptions.paths = { "@/*": ["./src/*"] };
  });
  await writeFile(
    path.join(app, "vite.config.ts"),
    `import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": "/src" } },
});
`,
  );
  await cladux(app, "init", "--style", "css");
  await cladux(app, "add", ...COMPONENTS);
  await writeFile(
    path.join(app, "src/App.tsx"),
    PAGE.replace("export default function Page", "export default function App"),
  );
  await run("npm", ["run", "build"], app);

  const port = await freePort();
  const server = await serve(
    "npx",
    ["vite", "preview", "--port", String(port), "--strictPort"],
    app,
    `http://localhost:${port}`,
  );
  try {
    await check(page, `http://localhost:${port}`);
  } finally {
    server.kill();
  }
});
