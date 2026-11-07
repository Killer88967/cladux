"use client";

import { Trash2Icon } from "lucide-react";
import * as React from "react";

import { Button } from "../button/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../card/card";
import { Input } from "../input/input";
import { NumberInput } from "../number-input/number-input";
import { Separator } from "../separator/separator";

interface Line {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  color: string;
}

const initial: Line[] = [
  {
    id: "1",
    name: "Runner Classic",
    variant: "Red · US 9",
    price: 129,
    quantity: 1,
    color: "#d9312b",
  },
  {
    id: "2",
    name: "Trail Sock, 3 pack",
    variant: "Gray · M",
    price: 24,
    quantity: 2,
    color: "#9ca3af",
  },
  {
    id: "3",
    name: "Water Bottle",
    variant: "Blue · 750 ml",
    price: 32,
    quantity: 1,
    color: "#2b62d9",
  },
];

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function Cart01() {
  const [lines, setLines] = React.useState(initial);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 8;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;

  const setQuantity = (id: string, quantity: number) =>
    setLines((all) => all.map((l) => (l.id === id ? { ...l, quantity } : l)));

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="cart-heading" className="min-w-0">
        <h1 id="cart-heading" className="mb-6 text-2xl font-semibold tracking-tight">
          Your bag{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({lines.reduce((n, l) => n + l.quantity, 0)} items)
          </span>
        </h1>
        {lines.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Your bag is empty.
          </p>
        ) : (
          <ul className="divide-y border-y">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-4 py-5">
                <div
                  aria-hidden
                  className="size-20 shrink-0 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${line.color}, ${line.color}55)` }}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{line.name}</p>
                    <p className="text-sm text-muted-foreground">{line.variant}</p>
                    <p className="mt-1 text-sm">{money(line.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <NumberInput
                      value={line.quantity}
                      onValueChange={(v) => setQuantity(line.id, v ?? 1)}
                      min={1}
                      max={10}
                      aria-label={`Quantity of ${line.name}`}
                      className="w-28"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${line.name}`}
                      onClick={() => setLines((all) => all.filter((l) => l.id !== line.id))}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                  <p className="font-medium tabular-nums sm:w-20 sm:text-end">
                    {money(line.price * line.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card className="h-fit lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="tabular-nums">{shipping ? money(shipping) : "Free"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated tax</span>
            <span className="tabular-nums">{money(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{money(subtotal + shipping + tax)}</span>
          </div>
          <form className="mt-2 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input placeholder="Discount code" aria-label="Discount code" />
            <Button type="submit" variant="outline">
              Apply
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" disabled={lines.length === 0}>
            Check out
          </Button>
          <p className="text-xs text-muted-foreground">Free shipping on orders over $100.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
