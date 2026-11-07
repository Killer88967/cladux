"use client";

import { HeartIcon, ShoppingBagIcon, TruckIcon } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion/accordion";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Label } from "../label/label";
import { NumberInput } from "../number-input/number-input";
import { Rating } from "../rating/rating";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group/toggle-group";

const photo =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80";

// One photo, recolored for each color with a hue shift. Use a photo per color in your shop.
const colors = [
  { name: "Red", swatch: "#d9312b", filter: "none" },
  { name: "Blue", swatch: "#2b62d9", filter: "hue-rotate(210deg)" },
  { name: "Green", swatch: "#2f9e57", filter: "hue-rotate(120deg)" },
];

const sizes = ["7", "8", "9", "10", "11", "12"];

export default function Product01() {
  const [color, setColor] = React.useState(colors[0]!.name);
  const [size, setSize] = React.useState("");
  const current = colors.find((c) => c.name === color) ?? colors[0]!;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="aspect-square overflow-hidden rounded-xl bg-muted">
          <img
            src={photo}
            alt={`Runner sneaker in ${current.name.toLowerCase()}`}
            className="size-full object-cover transition-[filter] duration-300"
            style={{ filter: current.filter }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-label={`Show ${c.name.toLowerCase()}`}
              aria-pressed={c.name === color}
              onClick={() => setColor(c.name)}
              className="aspect-square overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:ring-2 aria-pressed:ring-primary"
            >
              <img
                src={photo}
                alt=""
                className="size-full object-cover"
                style={{ filter: c.filter }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            New arrival
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Runner Classic</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Rating value={4.5} readOnly size="sm" aria-label="Rated 4.5 out of 5" />
            <span>4.5 · 128 reviews</span>
          </div>
          <p className="text-2xl font-semibold">$129</p>
          <p className="text-muted-foreground">
            A lightweight everyday sneaker with a breathable knit upper and a cushioned sole that
            lasts.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Label id="color-label">
            Color: <span className="font-normal text-muted-foreground">{color}</span>
          </Label>
          <ToggleGroup
            type="single"
            value={color}
            onValueChange={(v) => v && setColor(v)}
            aria-labelledby="color-label"
            className="gap-2"
          >
            {colors.map((c) => (
              <ToggleGroupItem
                key={c.name}
                value={c.name}
                aria-label={c.name}
                className="size-9 rounded-full p-0 data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-background"
              >
                <span className="size-6 rounded-full" style={{ backgroundColor: c.swatch }} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label id="size-label">Size (US)</Label>
            <a
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Size guide
            </a>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={size}
            onValueChange={setSize}
            aria-labelledby="size-label"
            className="grid w-full grid-cols-6"
          >
            {sizes.map((s) => (
              <ToggleGroupItem key={s} value={s}>
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex gap-3">
          <NumberInput defaultValue={1} min={1} max={10} aria-label="Quantity" className="w-28" />
          <Button className="flex-1" disabled={!size}>
            <ShoppingBagIcon />
            {size ? "Add to bag" : "Pick a size"}
          </Button>
          <Button variant="outline" size="icon" aria-label="Save to wishlist">
            <HeartIcon />
          </Button>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <TruckIcon className="size-4" /> Free shipping on orders over $100
        </p>

        <Accordion type="single" collapsible className="border-t">
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Knit upper from recycled polyester. Foam midsole, rubber outsole. Weighs 260 g in a
              size 9.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping and returns</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Ships in 1 to 2 business days. Free returns within 30 days, in the original box.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
