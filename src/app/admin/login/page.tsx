import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function LoginFormWithParams({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const notice = first(params.error) === "not-admin" ? "This account does not have admin access." : undefined;
  return <LoginForm next={first(params.next)} notice={notice} />;
}

function NotConfigured() {
  return (
    <div role="status" className="flex flex-col gap-2 rounded-md border border-sea-200 bg-sea-50 px-4 py-4 text-sm text-ink">
      <p className="font-semibold">Supabase is not configured yet.</p>
      <p className="text-ink-muted">
        Add <code className="rounded-sm bg-surface-card px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="rounded-sm bg-surface-card px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then restart. See{" "}
        <code className="rounded-sm bg-surface-card px-1">docs/DEVELOPMENT.md</code> for the full setup.
      </p>
    </div>
  );
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8 rounded-xl bg-surface-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="relative block size-20">
            <Image src="/logo.png" alt="Sea Soul Sandadi" fill sizes="80px" className="object-contain" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-ink">Admin sign in</h1>
            <p className="text-sm text-ink-muted">Manage photos, the edition, FAQs and page text.</p>
          </div>
        </div>

        {isSupabaseConfigured ? (
          <Suspense fallback={<div aria-busy="true" className="h-64 animate-pulse rounded-md bg-sand-100" />}>
            <LoginFormWithParams searchParams={searchParams} />
          </Suspense>
        ) : (
          <NotConfigured />
        )}
      </div>
    </main>
  );
}
