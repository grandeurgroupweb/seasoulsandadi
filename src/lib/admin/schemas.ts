import { z } from "zod";
import type { CategoryId, ContentKey, Placement } from "@/lib/types";

export const PLACEMENTS = ["gallery", "hero", "vendor", "reel"] as const satisfies readonly Placement[];

export const CATEGORY_IDS = [
  "flea-market",
  "food",
  "music-dance",
  "pets",
  "workshops",
  "photo-moments",
] as const satisfies readonly CategoryId[];

export const PLACEMENT_LABELS: Record<Placement, string> = {
  gallery: "Gallery",
  hero: "Hero",
  vendor: "Vendor",
  reel: "Reel",
};

export const PLACEMENT_FOLDERS: Record<Placement, string> = {
  gallery: "gallery",
  hero: "hero",
  vendor: "vendor",
  reel: "reels",
};

export const CONTENT_KEYS = [
  "hero_eyebrow",
  "hero_title",
  "hero_tagline",
  "experience_title",
  "experience_intro",
  "edition_title",
  "gallery_title",
  "gallery_intro",
  "vendor_title",
  "vendor_body",
  "vendor_cta_label",
  "reels_title",
  "reels_intro",
  "faq_title",
  "faq_intro",
  "follow_title",
  "footer_tagline",
  "footer_about",
] as const satisfies readonly ContentKey[];

// Titles and button labels may not be blank; intros/body copy may be (they are hidden publicly when empty).
export const REQUIRED_CONTENT_KEYS = new Set<ContentKey>([
  "hero_title",
  "experience_title",
  "edition_title",
  "gallery_title",
  "vendor_title",
  "vendor_cta_label",
  "reels_title",
  "faq_title",
  "follow_title",
  "footer_tagline",
]);

export const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;
export const ACCEPTED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const STORAGE_PATH_PATTERN = /^(gallery|hero|vendor|reels)\/[0-9a-f-]{36}\.(webp|jpg)$/;

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const httpsUrl = z
  .string()
  .trim()
  .max(500, "Keep the link under 500 characters")
  .refine(isHttpsUrl, "Enter a full link starting with https://");

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(500, "Keep the link under 500 characters")
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || isHttpsUrl(v), "Enter a full link starting with https://");

export const imageMetaSchema = z
  .object({
    alt: z
      .string()
      .trim()
      .min(5, "Describe the photo in at least 5 characters")
      .max(200, "Keep alt text under 200 characters"),
    category_id: z.enum(CATEGORY_IDS).nullable(),
    placement: z.enum(PLACEMENTS),
    link_url: optionalHttpsUrl,
    is_published: z.boolean(),
  })
  .transform((v) => ({ ...v, link_url: v.placement === "reel" ? v.link_url : null }));

export const newImageSchema = z.object({
  meta: imageMetaSchema,
  storage_path: z.string().regex(STORAGE_PATH_PATTERN, "Unexpected file path"),
  width: z.number().int().positive().max(5000),
  height: z.number().int().positive().max(5000),
});

export const editionSchema = z
  .object({
    title: z.string().trim().min(1, "Add a title").max(80, "Keep the title under 80 characters"),
    month_label: z.string().trim().min(1, "Add the month").max(40, "Keep this under 40 characters"),
    date_announced: z.boolean(),
    event_date: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : v))
      .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a valid date"),
    venue_name: z.string().trim().min(1, "Add the venue").max(80, "Keep this under 80 characters"),
    venue_city: z.string().trim().min(1, "Add the city").max(80, "Keep this under 80 characters"),
    map_url: optionalHttpsUrl,
    highlights: z.string().trim().max(160, "Keep highlights under 160 characters"),
    theme: z.string().trim().regex(/^[a-z0-9-]{1,40}$/, "Pick a theme"),
  })
  .superRefine((v, ctx) => {
    if (v.date_announced && !v.event_date) {
      ctx.addIssue({ code: "custom", path: ["event_date"], message: "Pick the event date, or turn off “Date announced”" });
    }
  });

export const faqSchema = z.object({
  question: z.string().trim().min(1, "Add the question").max(200, "Keep the question under 200 characters"),
  answer: z.string().trim().min(1, "Add the answer").max(1000, "Keep the answer under 1000 characters"),
  is_published: z.boolean(),
});

export const settingsSchema = z.object({
  whatsapp_number: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^\d{10,15}$/.test(v), "Use 10–15 digits including the country code, e.g. 919573435222"),
  whatsapp_message: z.string().trim().min(1, "Add a starting message").max(300, "Keep the message under 300 characters"),
  instagram_url: httpsUrl,
  facebook_url: httpsUrl,
  email: z.string().trim().pipe(z.email("Enter a valid email address")),
  phone_display: z.string().trim().min(1, "Add the phone number to show").max(40, "Keep this under 40 characters"),
});

export const contentEntriesSchema = z
  .array(
    z.object({
      key: z.enum(CONTENT_KEYS),
      value: z.string().trim().max(600, "Keep this under 600 characters"),
    }),
  )
  .min(1)
  .superRefine((entries, ctx) => {
    entries.forEach((entry, i) => {
      if (REQUIRED_CONTENT_KEYS.has(entry.key) && entry.value === "") {
        ctx.addIssue({ code: "custom", path: [i, "value"], message: "This one can't be empty" });
      }
    });
  });

export const categoryEntriesSchema = z
  .array(
    z.object({
      id: z.enum(CATEGORY_IDS),
      label: z.string().trim().min(1, "Add a name").max(40, "Keep the name under 40 characters"),
      description: z.string().trim().max(200, "Keep the description under 200 characters"),
    }),
  )
  .min(1);

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1).max(200),
});

export type FieldErrors = Record<string, string | undefined>;

/** Flattens zod issues into { "field.path": "first message" } for inline errors. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
