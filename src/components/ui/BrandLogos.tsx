import { SiFacebook, SiWhatsapp } from "react-icons/si";

// Third-party marks keep their official colours: the one owner-approved exception to the 3-colour palette.
const FACEBOOK_BLUE = "#1877F2";
const WHATSAPP_GREEN = "#25D366";

type LogoProps = { className?: string };

// The gradient is CSS, not an SVG <defs> id: a shared id breaks every copy when the first one is hidden (display:none).
const INSTAGRAM_GRADIENT =
  "radial-gradient(circle at 30% 107%, #FEDA75 0%, #FA7E1E 25%, #D62976 50%, #962FBF 75%, #4F5BD5 100%)";

export function InstagramLogo({ className = "size-6" }: LogoProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-[28%] ${className}`}
      style={{ background: INSTAGRAM_GRADIENT }}
    >
      <svg viewBox="0 0 24 24" className="size-full" focusable="false">
        <rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="16.1" cy="7.9" r="1.05" fill="#fff" />
      </svg>
    </span>
  );
}

export function FacebookLogo({ className = "size-6" }: LogoProps) {
  return <SiFacebook aria-hidden="true" className={className} style={{ color: FACEBOOK_BLUE }} />;
}

export function WhatsAppLogo({ className = "size-6" }: LogoProps) {
  return <SiWhatsapp aria-hidden="true" className={className} style={{ color: WHATSAPP_GREEN }} />;
}

export type SocialPlatform = "instagram" | "facebook" | "whatsapp";

export function BrandLogo({ platform, className }: { platform: SocialPlatform; className?: string }) {
  if (platform === "instagram") return <InstagramLogo className={className} />;
  if (platform === "facebook") return <FacebookLogo className={className} />;
  return <WhatsAppLogo className={className} />;
}
