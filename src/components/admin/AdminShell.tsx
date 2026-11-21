"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ComponentType, type ReactNode } from "react";
import {
  LuCalendarDays,
  LuCircleHelp,
  LuExternalLink,
  LuFileText,
  LuImages,
  LuLogOut,
  LuMenu,
  LuSettings,
  LuX,
} from "react-icons/lu";
import { logout } from "@/lib/admin/actions/auth";
import { ToastProvider } from "./Toast";

const NAV: { href: string; label: string; icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }> }[] = [
  { href: "/admin/gallery", label: "Gallery", icon: LuImages },
  { href: "/admin/edition", label: "Edition", icon: LuCalendarDays },
  { href: "/admin/faq", label: "FAQ", icon: LuCircleHelp },
  { href: "/admin/content", label: "Content", icon: LuFileText },
  { href: "/admin/settings", label: "Settings", icon: LuSettings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                active ? "bg-sea-700 text-sand-50" : "text-sand-100 hover:bg-sea-800 hover:text-sand-50"
              }`}
            >
              {active ? (
                <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-pill bg-terracotta-500" />
              ) : null}
              <Icon aria-hidden className="size-5 shrink-0" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function NavFooter({ email }: { email: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-sea-700 pt-4">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sand-100 hover:bg-sea-800 hover:text-sand-50"
      >
        <LuExternalLink aria-hidden className="size-5" />
        View site
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      <form action={logout}>
        <button
          type="submit"
          className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-sand-100 hover:bg-sea-800 hover:text-sand-50"
        >
          <LuLogOut aria-hidden className="size-5" />
          Sign out
        </button>
      </form>
      {email ? <p className="truncate px-3 pt-2 text-xs text-sand-300">{email}</p> : null}
    </div>
  );
}

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span className="relative block size-10 shrink-0 overflow-hidden rounded-pill bg-sand-100">
        <Image src="/logo.png" alt="" fill sizes="40px" className="object-contain p-0.5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-sand-50">Sea Soul Sandadi</span>
        <span className="text-xs text-sand-300">Admin</span>
      </span>
    </span>
  );
}

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const current = NAV.find((n) => pathname.startsWith(n.href))?.label ?? "Admin";

  // Close the mobile sheet whenever the route changes.
  useEffect(() => {
    sheetRef.current?.close();
  }, [pathname]);

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-1 flex-col lg:flex-row">
        <aside className="hidden w-62 shrink-0 flex-col gap-6 bg-sea-900 px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-dvh">
          <Brand />
          <nav aria-label="Admin" className="flex-1">
            <NavLinks />
          </nav>
          <NavFooter email={email} />
        </aside>

        <div className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-sea-900 px-4 lg:hidden">
          <Brand />
          <span className="truncate text-sm font-semibold text-sand-100">{current}</span>
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex size-11 items-center justify-center rounded-pill text-sand-50 hover:bg-sea-800"
            onClick={() => sheetRef.current?.showModal()}
          >
            <LuMenu aria-hidden className="size-6" />
          </button>
        </div>

        <dialog
          ref={sheetRef}
          aria-label="Admin menu"
          className="m-0 ms-auto h-dvh max-h-dvh w-[min(20rem,85vw)] bg-sea-900 p-0 text-sand-100 backdrop:bg-sea-950/60 lg:hidden"
        >
          <div className="flex h-full flex-col gap-6 px-4 py-5">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex size-11 items-center justify-center rounded-pill text-sand-50 hover:bg-sea-800"
                onClick={() => sheetRef.current?.close()}
              >
                <LuX aria-hidden className="size-6" />
              </button>
            </div>
            <nav aria-label="Admin" className="flex-1">
              <NavLinks onNavigate={() => sheetRef.current?.close()} />
            </nav>
            <NavFooter email={email} />
          </div>
        </dialog>

        <main id="admin-main" className="min-w-0 flex-1 bg-surface-raised px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
