import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster, TooltipProvider } from "@cladux/ui";
import { DomRuntime } from "@/components/dom-runtime";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cladux",
    template: "%s · Cladux",
  },
  description: "Components, CSS and TypeScript utilities for building websites.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
            <DomRuntime />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
