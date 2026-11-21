import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqManager } from "@/components/admin/FaqManager";
import { LoadError, PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import type { Faq } from "@/lib/types";

export const metadata: Metadata = { title: "FAQ", robots: { index: false, follow: false } };

async function FaqData() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order").returns<Faq[]>();
  if (error) return <LoadError what="the questions" />;
  return <FaqManager faqs={data ?? []} />;
}

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="FAQ"
        description="Questions shown in the FAQ section, in this order. Hide a question to take it off the site without deleting it."
      />
      <Suspense fallback={<PanelSkeleton rows={5} />}>
        <FaqData />
      </Suspense>
    </>
  );
}
