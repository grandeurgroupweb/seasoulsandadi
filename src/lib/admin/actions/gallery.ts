"use server";

import { MEDIA_BUCKET } from "@/lib/supabase/env";
import { adminClientForAction } from "../auth";
import { moveRow } from "../reorder";
import { fail, SESSION_EXPIRED, type ActionResult } from "../result";
import { afterWrite } from "../revalidate";
import { imageMetaSchema, newImageSchema, toFieldErrors } from "../schemas";
import { z } from "zod";

const idSchema = z.uuid();

/** Called after the browser has uploaded the resized file to Storage. */
export async function createImage(input: unknown): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;

  const parsed = newImageSchema.safeParse(input);
  if (!parsed.success) return fail("Check the highlighted fields.", toFieldErrors(parsed.error));
  const { meta, storage_path, width, height } = parsed.data;

  const { data: last } = await supabase
    .from("gallery_images")
    .select("sort_order")
    .eq("placement", meta.placement)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("gallery_images").insert({
    ...meta,
    storage_path,
    width,
    height,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  if (error) return fail("Couldn't save the photo details. Try again.");

  afterWrite();
  return { ok: true, message: "Photo added" };
}

export async function updateImage(id: string, input: unknown): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;
  if (!idSchema.safeParse(id).success) return fail("Unknown photo.");

  const parsed = imageMetaSchema.safeParse(input);
  if (!parsed.success) return fail("Check the highlighted fields.", toFieldErrors(parsed.error));

  const { error } = await supabase.from("gallery_images").update(parsed.data).eq("id", id);
  if (error) return fail("Couldn't save the changes. Try again.");

  afterWrite();
  return { ok: true, message: "Saved" };
}

export async function setImagePublished(id: string, isPublished: boolean): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;
  if (!idSchema.safeParse(id).success || typeof isPublished !== "boolean") return fail("Unknown photo.");

  const { error } = await supabase.from("gallery_images").update({ is_published: isPublished }).eq("id", id);
  if (error) return fail("Couldn't update the photo. Try again.");

  afterWrite();
  return { ok: true, message: isPublished ? "Photo is live" : "Photo hidden from the site" };
}

export async function moveImage(id: string, direction: "up" | "down"): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;
  if (!idSchema.safeParse(id).success || (direction !== "up" && direction !== "down")) return fail("Unknown photo.");

  const { data: current } = await supabase.from("gallery_images").select("placement").eq("id", id).maybeSingle();
  if (!current) return fail("That photo no longer exists. Refresh the page.");

  const { data: rows, error } = await supabase
    .from("gallery_images")
    .select("id")
    .eq("placement", current.placement)
    .order("sort_order")
    .order("created_at");
  if (error || !rows) return fail("Couldn't load the photo order. Try again.");

  const moveError = await moveRow(supabase, "gallery_images", rows, id, direction);
  if (moveError) return fail(moveError);

  afterWrite();
  return { ok: true, message: "Order saved" };
}

/** Removes the Storage object first; the row is only deleted once the file is gone. */
export async function deleteImage(id: string): Promise<ActionResult> {
  const supabase = await adminClientForAction();
  if (!supabase) return SESSION_EXPIRED;
  if (!idSchema.safeParse(id).success) return fail("Unknown photo.");

  const { data: row } = await supabase.from("gallery_images").select("storage_path").eq("id", id).maybeSingle();
  if (!row) return fail("That photo no longer exists. Refresh the page.");

  const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([row.storage_path]);
  if (storageError) return fail("Couldn't delete the file from storage, so the photo was kept. Try again.");

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) return fail("The file was removed but the record couldn't be deleted. Try again.");

  afterWrite();
  return { ok: true, message: "Photo deleted" };
}
