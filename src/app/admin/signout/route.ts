import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// Reached when a signed-in user turns out not to be an admin. Server Components can't clear
// cookies, and proxy.ts would bounce a signed-in user away from /admin/login, so sign out here.
export async function GET(request: NextRequest) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const loginUrl = new URL("/admin/login", request.url);
  if (request.nextUrl.searchParams.get("reason") === "not-admin") loginUrl.searchParams.set("error", "not-admin");
  return NextResponse.redirect(loginUrl);
}
