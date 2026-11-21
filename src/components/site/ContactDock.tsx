import { PiPhoneFill } from "react-icons/pi";
import { BrandLogo } from "@/components/ui/BrandLogos";
import type { SiteSettings } from "@/lib/types";

const fab =
  "group relative grid size-14 place-items-center rounded-pill shadow-lift ring-1 transition-transform duration-300 ease-out-soft hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring";

// Label that slides out to the left on hover / keyboard focus (desktop); the aria-label carries it for screen readers.
const tip =
  "pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-pill bg-sea-900 px-3 py-1.5 text-sm font-semibold text-sand-50 opacity-0 shadow-soft transition-[opacity,transform] duration-200 ease-out-soft translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100";

/** Call and WhatsApp buttons pinned to the bottom-right corner on every screen. */
export function ContactDock({ settings }: { settings: SiteSettings }) {
  const phone = settings.phone_display.replace(/\D/g, "");
  const whatsapp = settings.whatsapp_number.replace(/\D/g, "");
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Sea Soul Sandadi! ")}`;

  return (
    <nav
      aria-label="Contact us"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex flex-col gap-3 sm:bottom-6 sm:right-6"
    >
      <a href={`tel:+${phone}`} aria-label={`Call us at ${settings.phone_display}`} className={`${fab} bg-terracotta-500 text-white ring-2 ring-white`}>
        <PiPhoneFill aria-hidden="true" className="size-7" />
        <span aria-hidden="true" className={tip}>
          Call us
        </span>
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp (opens in a new tab)"
        className={`${fab} bg-white ring-line`}
      >
        {/* soft pulse to draw the eye; off with reduced motion */}
        <span aria-hidden="true" className="absolute inset-0 rounded-pill bg-sand-50 motion-safe:animate-ping motion-safe:[animation-duration:2.4s]" />
        <BrandLogo platform="whatsapp" className="relative size-8" />
        <span aria-hidden="true" className={tip}>
          WhatsApp us
        </span>
      </a>
    </nav>
  );
}
