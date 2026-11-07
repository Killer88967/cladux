"use client";

import { DownloadIcon } from "lucide-react";
import * as React from "react";
import { Button, Input, Label, QrCode, Switch, ToggleGroup, ToggleGroupItem } from "@cladux/ui";

// A logo for the middle, as a data URL so it works offline and exports cleanly.
const logo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#7c3aed"/><path d="M15.5 8.5a5 5 0 1 0 0 7" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>',
)}`;

/** The code as a standalone SVG file, with the theme's colors written in. */
function svgFile(svg: SVGSVGElement) {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  const { color, backgroundColor } = getComputedStyle(svg);
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copy.setAttribute("width", "512");
  copy.setAttribute("height", "512");
  copy.removeAttribute("class");
  copy.removeAttribute("style");
  copy.querySelectorAll("path").forEach((p) => p.setAttribute("fill", color));
  const [x, y, w, h] = copy.getAttribute("viewBox")!.split(" ");
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  Object.entries({ x, y, width: w, height: h, fill: backgroundColor }).forEach(([k, v]) =>
    bg.setAttribute(k, v!),
  );
  copy.prepend(bg);
  return new XMLSerializer().serializeToString(copy);
}

export default function QrCodeGenerator() {
  const ref = React.useRef<SVGSVGElement>(null);
  const [value, setValue] = React.useState("https://cladux.vercel.app");
  const [variant, setVariant] = React.useState<"classic" | "rounded" | "dots">("rounded");
  const [withLogo, setWithLogo] = React.useState(true);

  const download = () => {
    if (!ref.current) return;
    const url = URL.createObjectURL(new Blob([svgFile(ref.current)], { type: "image/svg+xml" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "qr-code.svg" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6 sm:flex-row sm:items-start">
      <QrCode
        ref={ref}
        value={value || " "}
        size={176}
        variant={variant}
        image={withLogo ? logo : undefined}
        className="rounded-xl border p-1"
      />
      <div className="flex w-full flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="qr-value">Text or link</Label>
          <Input id="qr-value" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={variant}
          onValueChange={(v) => v && setVariant(v as typeof variant)}
        >
          <ToggleGroupItem value="classic">Classic</ToggleGroupItem>
          <ToggleGroupItem value="rounded">Rounded</ToggleGroupItem>
          <ToggleGroupItem value="dots">Dots</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Switch id="qr-logo" checked={withLogo} onCheckedChange={setWithLogo} />
          <Label htmlFor="qr-logo">Logo in the middle</Label>
        </div>
        <Button variant="outline" className="self-start" onClick={download}>
          <DownloadIcon />
          Download SVG
        </Button>
      </div>
    </div>
  );
}
