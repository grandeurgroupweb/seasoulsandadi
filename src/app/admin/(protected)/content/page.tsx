import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { LoadError, PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import type { Category, SiteContentRow } from "@/lib/types";

export const metadata: Metadata = { title: "Content", robots: { index: false, follow: false } };

async function ContentData() {
  const { supabase } = await requireAdmin();
  const [content, categories] = await Promise.all([
    supabase.from("site_content").select("*").order("section").order("sort_order").returns<SiteContentRow[]>(),
    supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
  ]);
  if (content.error || categories.error) return <LoadError what="the page text" />;
  return <ContentEditor rows={content.data ?? []} categories={categories.data ?? []} />;
}

export default function ContentPage() {
  return (
    <>
      <PageHeader
        title="Page text"
        description="Headlines, intros and button labels on the public site. Each section saves on its own."
      />
      <Suspense fallback={<PanelSkeleton rows={6} />}>
        <ContentData />
      </Suspense>
    </>
  );
}
