"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { safeAdminPath } from "../auth";
import { loginSchema } from "../schemas";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  if (!isSupabaseConfigured) {
    return { error: "Supabase isn't connected yet, so sign-in is unavailable.", email };
  }

  const parsed = loginSchema.safeParse({ email, password: formData.get("password") ?? "" });
  if (!parsed.success) return { error: "Enter your email and password.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Same message for wrong email and wrong password, so accounts can't be probed.
    const message =
      error.status === 429 ? "Too many attempts. Wait a minute and try again." : "Email or password is incorrect.";
    return { error: message, email };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "This account does not have admin access.", email };
  }

  redirect(safeAdminPath(formData.get("next")));
}

export async function logout() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
