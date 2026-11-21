import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadError, PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { fallbackData } from "@/data/fallback";
import { requireAdmin } from "@/lib/admin/auth";
import type { SiteSettings } from "@/lib/types";

export const metadata: Metadata = { title: "Settings", robots: { index: false, follow: false } };

async function SettingsData() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle<SiteSettings>();
  if (error) return <LoadError what="the settings" />;
  return <SettingsForm settings={data ?? fallbackData.settings} />;
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="WhatsApp number for vendor enquiries, social links and contact details used across the site."
      />
      <Suspense fallback={<PanelSkeleton rows={3} />}>
        <SettingsData />
      </Suspense>
    </>
  );
}
