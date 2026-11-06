"use client";

import { CheckIcon, CodeIcon, TerminalIcon } from "lucide-react";
import * as React from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useCopyToClipboard,
} from "@cladux/ui";
import { cliCommand, usePackageManager } from "@/components/cli-command";
import { CopyButton } from "@/components/copy-button";

interface ChartCardProps {
  name: string;
  title: string;
  type: string;
  code: string;
  /** The code, highlighted by Shiki on the server. */
  html: string;
  /** The chart itself. */
  children: React.ReactNode;
}

/** One chart on /charts: the live chart, a button that copies the command to add it, and its code. */
export function ChartCard({ name, title, type, code, html, children }: ChartCardProps) {
  const [manager] = usePackageManager();
  const command = cliCommand(manager, `add ${name}`);
  const { copied, copy } = useCopyToClipboard();

  return (
    <section
      id={name}
      className="flex min-w-0 scroll-mt-24 flex-col gap-2 *:data-[slot=card]:flex-1"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">
          <a href={`#${name}`} className="hover:underline">
            {title}
          </a>
        </h2>
        <Badge variant="secondary">{type}</Badge>
        <div className="ms-auto flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Copy "${command}"`}
            title={command}
            onClick={() => copy(command)}
          >
            {copied ? <CheckIcon /> : <TerminalIcon />}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="View code">
                <CodeIcon />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription className="font-mono">{command}</DialogDescription>
              </DialogHeader>
              <div className="relative min-w-0 rounded-lg border bg-muted/50">
                <div className="flex items-center border-b px-4 py-2 font-mono text-xs text-muted-foreground">
                  components/cl/blocks/{name}.tsx
                </div>
                <div
                  className="max-h-[60vh] overflow-auto text-sm leading-relaxed [&_pre]:p-4"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                <CopyButton value={code} className="absolute top-1 right-2" />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {children}
    </section>
  );
}
