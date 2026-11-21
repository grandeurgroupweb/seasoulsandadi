import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { template: "%s · Admin · Sea Soul Sandadi", default: "Admin · Sea Soul Sandadi" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-1 flex-col bg-surface-raised text-ink">{children}</div>;
}
