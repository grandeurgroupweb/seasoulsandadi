import type { SiteData } from "@/lib/types";
import { HeaderShell } from "./header/HeaderShell";

export function Header({ data }: { data: SiteData }) {
  return <HeaderShell instagramUrl={data.settings.instagram_url} facebookUrl={data.settings.facebook_url} />;
}
