"use server";

import { adminClientForAction } from "../auth";
import { fail, SESSION_EXPIRED, type ActionResult } from "../result";
import { afterWrite } from "../revalidate";
import { categoryEntriesSchema, contentEntriesSchema, toFieldErrors } from "../schemas";

/** Saves one section's copy. Keys are fixed: values are updated, never inserted or deleted. */
export async function saveContentSection(entries: unknown): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;

  const parsed = contentEntriesSchema.safeParse(entries);
  if (!parsed.success) return fail("Check the highlighted fields.", toFieldErrors(parsed.error));

  const results = await Promise.all(
    parsed.data.map(({ key, value }) => supabase.from("site_content").update({ value }).eq("key", key)),
  );
  if (results.some((r) => r.error)) return fail("Some changes didn't save. Try again.");

  afterWrite();
  return { ok: true, message: "Section saved" };
}

export async function saveCategories(entries: unknown): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;

  const parsed = categoryEntriesSchema.safeParse(entries);
  if (!parsed.success) return fail("Check the highlighted fields.", toFieldErrors(parsed.error));

  const results = await Promise.all(
    parsed.data.map(({ id, label, description }) =>
      supabase.from("categories").update({ label, description }).eq("id", id),
    ),
  );
  if (results.some((r) => r.error)) return fail("Some changes didn't save. Try again.");

  afterWrite();
  return { ok: true, message: "Categories saved" };
}
