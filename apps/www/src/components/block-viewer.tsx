"use client";

import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";
import * as React from "react";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
  useCopyToClipboard,
} from "@cladux/ui";
import { CopyButton } from "@/components/copy-button";
import { cliCommand, usePackageManager } from "@/components/cli-command";

const WIDTHS = { desktop: "100%", tablet: "768px", mobile: "390px" } as const;

interface BlockViewerProps {
  name: string;
  title: string;
  description: string;
  code: string;
  /** The code, highlighted by Shiki on the server. */
  html: string;
}

/** One block: a resizable live preview in an iframe, its code and the command to add it. */
export function BlockViewer({ name, title, description, code, html }: BlockViewerProps) {
  const [width, setWidth] = React.useState<keyof typeof WIDTHS>("desktop");
  const [height, setHeight] = React.useState(600);
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [manager] = usePackageManager();
  const command = cliCommand(manager, `add ${name}`);
  const { copied, copy } = useCopyToClipboard();

  // Size the iframe to its content (same origin, so we can measure it).
  React.useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    let observer: ResizeObserver | undefined;
    const attach = () => {
      const root = iframe.contentDocument?.getElementById("block-root");
      if (!root) return;
      observer?.disconnect();
      const measure = () => setHeight(Math.max(64, Math.ceil(root.getBoundingClientRect().height)));
      observer = new ResizeObserver(measure);
      observer.observe(root);
      measure();
    };
    iframe.addEventListener("load", attach);
    attach();
    return () => {
      iframe.removeEventListener("load", attach);
      observer?.disconnect();
    };
  }, []);

  return (
    <section id={name} className="scroll-mt-20">
      <Tabs defaultValue="preview" className="gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="me-auto min-w-0">
            <h2 className="font-medium">
              <a href={`#${name}`} className="hover:underline">
                {title}
              </a>
            </h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={width}
            onValueChange={(v) => v && setWidth(v as keyof typeof WIDTHS)}
            className="hidden lg:flex"
            aria-label="Preview width"
          >
            <ToggleGroupItem value="desktop" aria-label="Desktop">
              <MonitorIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" aria-label="Tablet">
              <TabletIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" aria-label="Phone">
              <SmartphoneIcon />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" className="font-mono" onClick={() => copy(command)}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span className="max-w-60 truncate">{command}</span>
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <a
              href={`/view/${name}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Open in a new tab"
            >
              <ExternalLinkIcon />
            </a>
          </Button>
        </div>
        <TabsContent value="preview" forceMount className="data-[state=inactive]:hidden">
          <div className="overflow-hidden rounded-xl border bg-muted/30">
            <iframe
              ref={frame}
              src={`/view/${name}`}
              title={`${title} preview`}
              loading="lazy"
              className="mx-auto block bg-background transition-[width] duration-300 data-[width=desktop]:border-0 data-[width=mobile]:border-x data-[width=tablet]:border-x"
              data-width={width}
              style={{ width: WIDTHS[width], height }}
            />
          </div>
        </TabsContent>
        <TabsContent value="code">
          <div className="relative rounded-xl border bg-muted/50">
            <div className="flex items-center border-b px-4 py-2 font-mono text-xs text-muted-foreground">
              components/cl/blocks/{name}.tsx
            </div>
            <div
              className="max-h-[32rem] overflow-auto text-sm leading-relaxed [&_pre]:p-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <CopyButton value={code} className="absolute top-1 right-2" />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
