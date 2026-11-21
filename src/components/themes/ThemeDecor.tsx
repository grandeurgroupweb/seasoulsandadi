import type { ReactNode } from "react";
import { themeSlot, type ThemeSlot } from ".";

/** Renders the active theme's decor for this slot, or `children` (the coastal decor) when the theme has none. */
export function ThemeDecor({ theme, slot, children }: { theme?: string; slot: ThemeSlot; children?: ReactNode }) {
  const render = themeSlot(theme, slot);
  return <>{render ? render() : children}</>;
}
