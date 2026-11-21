import type { ReactNode } from "react";
import { BrandLogo, type SocialPlatform } from "./BrandLogos";

type Props = {
  platform: SocialPlatform;
  href: string;
  children: ReactNode;
  /** "solid": cream pill for any background. "glass": translucent pill for photo/dark backgrounds. */
  tone?: "solid" | "glass";
  size?: "md" | "lg";
  className?: string;
};

/** Outbound social link styled around the platform's real logo. */
export function SocialButton({ platform, href, children, tone = "solid", size = "md", className = "" }: Props) {
  const toneClass =
    tone === "glass"
      ? "border border-sand-50/40 bg-sand-50/15 text-sand-50 backdrop-blur-md hover:bg-sand-50/25"
      : "border border-line bg-surface-card text-ink shadow-soft hover:shadow-card";
  const sizeClass = size === "lg" ? "min-h-14 gap-3 pl-3 pr-6 text-base" : "min-h-12 gap-2.5 pl-2.5 pr-5 text-sm";
  const logoWrap = size === "lg" ? "size-9" : "size-8";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center rounded-pill font-semibold transition-[transform,box-shadow,background-color] duration-300 ease-out-soft hover:-translate-y-0.5 ${toneClass} ${sizeClass} ${className}`}
    >
      <span className={`grid ${logoWrap} shrink-0 place-items-center rounded-pill bg-white shadow-soft`}>
        <BrandLogo platform={platform} className="size-[60%] transition-transform duration-300 ease-out-soft group-hover:scale-110" />
      </span>
      <span>{children}</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
