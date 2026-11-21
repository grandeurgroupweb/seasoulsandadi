import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryManager } from "@/components/admin/gallery/GalleryManager";
import { LoadError, PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { publicMediaUrl } from "@/lib/supabase/env";
import type { Category, GalleryImage } from "@/lib/types";

export const metadata: Metadata = { title: "Gallery", robots: { index: false, follow: false } };

async function GalleryData() {
  const { supabase } = await requireAdmin();
  const [images, categories] = await Promise.all([
    supabase
      .from("gallery_images")
      .select("*")
      .order("placement")
      .order("sort_order")
      .order("created_at")
      .returns<GalleryImage[]>(),
    supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
  ]);

  if (images.error || categories.error) return <LoadError what="the photos" />;

  return (
    <GalleryManager
      images={(images.data ?? []).map((img) => ({ ...img, url: publicMediaUrl(img.storage_path) }))}
      categories={categories.data ?? []}
    />
  );
}

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="Gallery"
        description="Upload photos and choose where each one appears: the hero, the gallery strip, the vendor section or the Instagram reels row."
      />
      <Suspense fallback={<PanelSkeleton rows={4} />}>
        <GalleryData />
      </Suspense>
    </>
  );
}
