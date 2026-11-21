"use server";

import { z } from "zod";
import { adminClientForAction } from "../auth";
import { moveRow } from "../reorder";
import { fail, SESSION_EXPIRED, type ActionResult } from "../result";
import { afterWrite } from "../revalidate";
import { faqSchema, toFieldErrors } from "../schemas";

const idSchema = z.uuid();

/** Creates a FAQ when id is null, otherwise updates it. */
export async function saveFaq(id: string | null, input: unknown): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;
  if (id !== null && !idSchema.safeParse(id).success) return fail("Unknown question.");

  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return fail("Check the highlighted fields.", toFieldErrors(parsed.error));

  if (id) {
    const { error } = await supabase.from("faqs").update(parsed.data).eq("id", id);
    if (error) return fail("Couldn't save the question. Try again.");
  } else {
    const { data: last } = await supabase
      .from("faqs")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase
      .from("faqs")
      .insert({ ...parsed.data, sort_order: (last?.sort_order ?? 0) + 1 });
    if (error) return fail("Couldn't add the question. Try again.");
  }

  afterWrite();
  return { ok: true, message: id ? "Question saved" : "Question added" };
}

export async function setFaqPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;
  if (!idSchema.safeParse(id).success || typeof isPublished !== "boolean") return fail("Unknown question.");

  const { error } = await supabase.from("faqs").update({ is_published: isPublished }).eq("id", id);
  if (error) return fail("Couldn't update the question. Try again.");

  afterWrite();
  return { ok: true, message: isPublished ? "Question is live" : "Question hidden from the site" };
}

export async function moveFaq(id: string, direction: "up" | "down"): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;
  if (!idSchema.safeParse(id).success || (direction !== "up" && direction !== "down")) return fail("Unknown question.");

  const { data: rows, error } = await supabase.from("faqs").select("id").order("sort_order");
  if (error || !rows) return fail("Couldn't load the question order. Try again.");

  const moveError = await moveRow(supabase, "faqs", rows, id, direction);
  if (moveError) return fail(moveError);

  afterWrite();
  return { ok: true, message: "Order saved" };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;
  if (!idSchema.safeParse(id).success) return fail("Unknown question.");

  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return fail("Couldn't delete the question. Try again.");

  afterWrite();
  return { ok: true, message: "Question deleted" };
}
