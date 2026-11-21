"use server";

import { adminClientForAction } from "../auth";
import { fail, SESSION_EXPIRED, type ActionResult } from "../result";
import { afterWrite } from "../revalidate";
import { settingsSchema, toFieldErrors } from "../schemas";

export async function saveSettings(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;

  const parsed = settingsSchema.safeParse({
    whatsapp_number: formData.get("whatsapp_number") ?? "",
    whatsapp_message: formData.get("whatsapp_message") ?? "",
    instagram_url: formData.get("instagram_url") ?? "",
    facebook_url: formData.get("facebook_url") ?? "",
    email: formData.get("email") ?? "",
    phone_display: formData.get("phone_display") ?? "",
  });
  if (!parsed.success) return fail("Check the highlighted fields.", toFieldErrors(parsed.error));

  const { data, error } = await supabase.from("site_settings").update(parsed.data).eq("id", 1).select("id");
  if (error) return fail("Couldn't save the settings. Try again.");
  if (!data?.length) {
    const { error: insertError } = await supabase.from("site_settings").insert({ id: 1, ...parsed.data });
    if (insertError) return fail("Couldn't save the settings. Try again.");
  }

  afterWrite();
  return { ok: true, message: "Settings saved" };
}
