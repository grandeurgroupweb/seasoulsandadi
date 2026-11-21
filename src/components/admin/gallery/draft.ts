import { imageMetaSchema, toFieldErrors } from "@/lib/admin/schemas";
import type { ImageDraft, ImageDraftErrors } from "./ImageFields";

export function validateDraft(draft: ImageDraft): ImageDraftErrors | null {
  const parsed = imageMetaSchema.safeParse(draft);
  if (parsed.success) return null;
  return toFieldErrors(parsed.error) as ImageDraftErrors;
}
