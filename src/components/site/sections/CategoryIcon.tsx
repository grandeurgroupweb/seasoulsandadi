import type { IconType } from "react-icons";
import {
  PiCamera,
  PiForkKnife,
  PiMusicNotes,
  PiPaintBrush,
  PiPawPrint,
  PiSparkle,
  PiStorefront,
} from "react-icons/pi";

// Admins can only pick from icon names stored in categories.icon; unknown names fall back.
const icons: Record<string, IconType> = {
  PiStorefront,
  PiForkKnife,
  PiMusicNotes,
  PiPawPrint,
  PiPaintBrush,
  PiCamera,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? PiSparkle;
  return <Icon aria-hidden="true" className={className} />;
}
