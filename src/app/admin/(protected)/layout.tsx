import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";

// The session read must sit behind Suspense (Cache Components); proxy.ts already redirects
// logged-out visitors, and this re-check also rejects signed-in users who aren't admins.
async function AdminGate({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}

function ShellFallback() {
  return (
    <div aria-busy="true" className="flex min-h-dvh flex-1">
      <div className="hidden w-62 bg-sea-900 lg:block" />
      <div className="flex-1 bg-surface-raised" />
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
