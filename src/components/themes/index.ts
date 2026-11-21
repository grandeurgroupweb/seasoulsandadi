import type { ReactNode } from "react";
import { sankranti } from "./sankranti";

/**
 * Seasonal decor themes. Each theme is one folder that fills some of these slots; any slot it
 * leaves out keeps the everyday coastal decor. Sections never import a theme directly, only
 * <ThemeDecor>, so a theme folder can be deleted without touching section code.
 *
 *   hero    sky of the hero (replaces the gulls)
 *   edition behind the This Edition band (replaces the gulls)
 *   follow  inside the Follow Us card (replaces the gulls)
 *   footer  over the footer beach (replaces the gulls)
 *   page    fixed layer over the whole page (nothing in coastal)
 */
export type ThemeSlot = "hero" | "edition" | "follow" | "footer" | "page";

export type Theme = {
  /** Shown only in the admin dropdown, never on the public site. */
  label: string;
  /** Each slot is a plain render function (no hooks), so lookups don't count as creating components. */
  slots: Partial<Record<ThemeSlot, () => ReactNode>>;
};

export const COASTAL = "coastal";

// To add a theme: create components/themes/<id>/ and add one line here. To remove: delete both.
const THEMES: Record<string, Theme> = {
  sankranti,
};

export function themeSlot(id: string | undefined, slot: ThemeSlot) {
  return id ? THEMES[id]?.slots[slot] : undefined;
}

/** Options for the admin dropdown, coastal first. */
export const THEME_OPTIONS: { id: string; label: string }[] = [
  { id: COASTAL, label: "Coastal (everyday)" },
  ...Object.entries(THEMES).map(([id, t]) => ({ id, label: t.label })),
];
