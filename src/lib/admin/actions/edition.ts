"use server";

import { adminClientForAction } from "../auth";
import { fail, SESSION_EXPIRED, type ActionResult } from "../result";
import { afterWrite } from "../revalidate";
import { editionSchema, toFieldErrors } from "../schemas";

export async function saveEdition(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;

  const parsed = editionSchema.safeParse({
    title: formData.get("title") ?? "",
    month_label: formData.get("month_label") ?? "",
    date_announced: formData.get("date_announced") === "on",
    event_date: formData.get("event_date") ?? "",
    venue_name: formData.get("venue_name") ?? "",
    venue_city: formData.get("venue_city") ?? "",
    map_url: formData.get("map_url") ?? "",
    highlights: formData.get("highlights") ?? "",
    theme: formData.get("theme") || "coastal",
  });
  if (!parsed.success) return fail("Check the highlighted fields.", toFieldErrors(parsed.error));

  // Single current edition: update row 1, creating it only if the seed never ran.
  const { data, error } = await supabase.from("editions").update(parsed.data).eq("id", 1).select("id");
  if (error) return fail("Couldn't save the edition. Try again.");
  if (!data?.length) {
    const { error: insertError } = await supabase.from("editions").insert({ id: 1, ...parsed.data });
    if (insertError) return fail("Couldn't save the edition. Try again.");
  }

  afterWrite();
  return { ok: true, message: "Edition saved" };
}
