import type { Metadata } from "next";
import { Suspense } from "react";
import { EditionForm } from "@/components/admin/EditionForm";
import { LoadError, PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { THEME_OPTIONS } from "@/components/themes";
import { fallbackData } from "@/data/fallback";
import { requireAdmin } from "@/lib/admin/auth";
import type { Edition } from "@/lib/types";

export const metadata: Metadata = { title: "Edition", robots: { index: false, follow: false } };

async function EditionData() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("editions").select("*").eq("id", 1).maybeSingle<Edition>();
  if (error) return <LoadError what="the edition" />;
  return <EditionForm edition={data ?? fallbackData.edition} themes={THEME_OPTIONS} />;
}

export default function EditionPage() {
  return (
    <>
      <PageHeader
        title="This edition"
        description="One current edition, updated each month. Keep “Date announced” off until the date is final."
      />
      <Suspense fallback={<PanelSkeleton rows={3} />}>
        <EditionData />
      </Suspense>
    </>
  );
}
