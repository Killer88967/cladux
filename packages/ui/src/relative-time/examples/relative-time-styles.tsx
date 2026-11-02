"use client";

import * as React from "react";
import { RelativeTime } from "@cladux/ui";

export default function RelativeTimeStyles() {
  const [date] = React.useState(() => Date.now() - 2 * 24 * 60 * 60 * 1000);

  return (
    <dl className="grid w-full max-w-xs grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      <dt className="text-muted-foreground">Default</dt>
      <dd>
        <RelativeTime date={date} />
      </dd>
      <dt className="text-muted-foreground">numeric=&quot;always&quot;</dt>
      <dd>
        <RelativeTime date={date} numeric="always" />
      </dd>
      <dt className="text-muted-foreground">style=&quot;short&quot;</dt>
      <dd>
        <RelativeTime date={date} numeric="always" style="short" />
      </dd>
      <dt className="text-muted-foreground">French</dt>
      <dd>
        <RelativeTime date={date} locale="fr" />
      </dd>
      <dt className="text-muted-foreground">Japanese</dt>
      <dd>
        <RelativeTime date={date} locale="ja" />
      </dd>
    </dl>
  );
}
