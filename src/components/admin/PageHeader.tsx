import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-prose flex-col gap-1">
        <h1 className="text-3xl font-bold text-ink">{title}</h1>
        <p className="text-ink-muted">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-sand-100" />
      ))}
    </div>
  );
}

export function LoadError({ what }: { what: string }) {
  return (
    <div role="alert" className="rounded-lg border border-terracotta-300 bg-terracotta-50 p-5 text-sm text-terracotta-800">
      Couldn&apos;t load {what}. Check your connection and refresh the page.
    </div>
  );
}
