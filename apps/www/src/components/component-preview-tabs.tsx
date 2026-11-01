"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cladux/ui";
import { cn } from "@cladux/utils";
import { CopyButton } from "@/components/copy-button";

interface ComponentPreviewTabsProps {
  preview: ReactNode;
  code: string;
  /** The same code, already highlighted by Shiki on the server. */
  html: string;
  align?: "center" | "start" | "end";
  previewClassName?: string;
}

export function ComponentPreviewTabs({
  preview,
  code,
  html,
  align = "center",
  previewClassName,
}: ComponentPreviewTabsProps) {
  return (
    <Tabs defaultValue="preview" className="my-6 gap-3">
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" forceMount className="data-[state=inactive]:hidden">
        <div
          data-align={align}
          className={cn(
            "flex min-h-72 w-full justify-center rounded-lg border p-6 data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start sm:p-10",
            previewClassName,
          )}
        >
          {preview}
        </div>
      </TabsContent>
      <TabsContent value="code">
        <div className="relative rounded-lg border bg-muted/50">
          <div
            className="max-h-120 overflow-auto text-sm leading-relaxed [&_pre]:p-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <CopyButton value={code} className="absolute top-2 right-2" />
        </div>
      </TabsContent>
    </Tabs>
  );
}
