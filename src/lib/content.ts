import { cacheLife, cacheTag } from "next/cache";
import { fallbackData } from "@/data/fallback";
import { isSupabaseConfigured, publicMediaUrl } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Category,
  Edition,
  Faq,
  GalleryImage,
  ResolvedImage,
  SiteContentRow,
  SiteData,
  SiteSettings,
} from "@/lib/types";

// Admin Server Actions call updateTag(SITE_TAG) so edits show up on the next request.
export const SITE_TAG = "site";

export async function getSiteData(): Promise<SiteData> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");

  if (!isSupabaseConfigured) return fallbackData;

  const sb = createPublicClient();
  const [categories, images, edition, faqs, settings, content] = await Promise.all([
    sb.from("categories").select("*").order("sort_order").returns<Category[]>(),
    sb
      .from("gallery_images")
      .select("*")
      .eq("is_published", true)
      .order("placement")
      .order("sort_order")
      .returns<GalleryImage[]>(),
    sb.from("editions").select("*").eq("id", 1).maybeSingle<Edition>(),
    sb.from("faqs").select("*").eq("is_published", true).order("sort_order").returns<Faq[]>(),
    sb.from("site_settings").select("*").eq("id", 1).maybeSingle<SiteSettings>(),
    sb.from("site_content").select("*").returns<SiteContentRow[]>(),
  ]);

  const resolvedImages: ResolvedImage[] | null = images.error
    ? null
    : (images.data ?? []).map((img) => ({ ...img, url: publicMediaUrl(img.storage_path) }));

  return {
    categories: categories.data?.length ? categories.data : fallbackData.categories,
    images: resolvedImages ?? fallbackData.images,
    edition: edition.data ?? fallbackData.edition,
    faqs: faqs.error ? fallbackData.faqs : (faqs.data ?? []),
    settings: settings.data ?? fallbackData.settings,
    content: {
      ...fallbackData.content,
      ...Object.fromEntries((content.data ?? []).map((row) => [row.key, row.value])),
    },
  };
}

export function imagesFor(data: SiteData, placement: ResolvedImage["placement"]) {
  return data.images.filter((img) => img.placement === placement);
}

export function whatsappHref(settings: SiteSettings) {
  const number = settings.whatsapp_number.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(settings.whatsapp_message)}`;
}
