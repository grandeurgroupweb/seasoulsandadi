import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type AdminClient = Awaited<ReturnType<typeof createClient>>;

export type AdminSession =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "forbidden" }
  | { status: "admin"; supabase: AdminClient; email: string };

// getUser() verifies the JWT with Supabase Auth; getSession() would trust the cookie blindly.
async function loadAdminSession(): Promise<AdminSession> {
  if (!isSupabaseConfigured) return { status: "unconfigured" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return { status: "forbidden" };
  return { status: "admin", supabase, email: user.email ?? "" };
}

/** Per-request memoized session for Server Components (layout + page share one lookup). */
export const getAdminSession = cache(loadAdminSession);

/** For Server Components: returns the admin session or redirects away. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (session.status === "admin") return session;
  if (session.status === "forbidden") redirect("/admin/signout?reason=not-admin");
  redirect("/admin/login");
}

/** For Server Actions: never trust the client, re-check on every call. */
export async function adminClientForAction(): Promise<AdminClient | null> {
  const session = await loadAdminSession();
  return session.status === "admin" ? session.supabase : null;
}

/** Only same-app admin paths are allowed as post-login destinations (no open redirects). */
export function safeAdminPath(value: unknown): string {
  if (typeof value !== "string") return "/admin/gallery";
  if (!value.startsWith("/admin/") || value.startsWith("/admin/login") || value.startsWith("/admin/signout")) {
    return "/admin/gallery";
  }
  if (value.includes("//") || value.includes("\\") || value.includes("..")) return "/admin/gallery";
  return value;
}
