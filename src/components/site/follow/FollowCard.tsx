import { Birds } from "@/components/decor/Birds";
import { Palm } from "@/components/decor/Palm";
import { ThemeDecor } from "@/components/themes/ThemeDecor";
import { RevealText } from "@/components/ui/RevealText";
import { SocialButton } from "@/components/ui/SocialButton";
import { whatsappHref } from "@/lib/content";
import type { SiteData } from "@/lib/types";

// Hand-drawn feel: wavy top/bottom and slightly uneven sides, in the card's own 0..1 box.
const BRUSH_EDGE =
  "M0.03,0.05 C0.18,0.005 0.32,0.045 0.5,0.02 C0.67,-0.004 0.82,0.042 0.975,0.018 C0.99,0.2 1,0.42 0.988,0.62 C0.982,0.78 0.996,0.88 0.982,0.975 C0.8,0.998 0.64,0.955 0.46,0.985 C0.3,1.01 0.15,0.962 0.018,0.982 C0.006,0.8 0.014,0.6 0.004,0.42 C0,0.26 0.012,0.14 0.03,0.05 Z";

export function FollowCard({ data }: { data: SiteData }) {
  const { content, settings } = data;

  return (
    <aside aria-labelledby="follow-title" className="relative isolate">
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <clipPath id="follow-brush" clipPathUnits="objectBoundingBox">
          <path d={BRUSH_EDGE} />
        </clipPath>
      </svg>

      {/* Offset terracotta stroke behind the card, like a second brush pass. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 translate-x-2.5 translate-y-3 -rotate-[1.5deg] bg-terracotta-400"
        style={{ clipPath: "url(#follow-brush)" }}
      />

      <div
        className="on-dark relative overflow-hidden bg-sea-700 px-7 pb-10 pt-12 sm:px-10"
        style={{ clipPath: "url(#follow-brush)" }}
      >
        <ThemeDecor theme={data.edition.theme} slot="follow">
          <Birds count={4} className="absolute right-6 top-8 w-28 text-sand-100/70 sm:w-32" />
        </ThemeDecor>
        <Palm className="absolute -bottom-6 -right-8 h-52 w-auto text-sea-900/55 sm:h-60" delay={2} />

        <div className="relative flex flex-col gap-4">
          <RevealText
            as="h2"
            id="follow-title"
            text={content.follow_title}
            className="font-serif text-4xl tracking-tight text-sand-50"
          />
          <p className="max-w-sm text-base text-sand-100">
            Edition dates, tickets and announcements go up on Instagram and Facebook first.
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:max-w-xs">
            <SocialButton platform="instagram" href={settings.instagram_url} size="lg">
              Follow on Instagram
            </SocialButton>
            <SocialButton platform="facebook" href={settings.facebook_url} size="lg">
              Follow on Facebook
            </SocialButton>
            <SocialButton platform="whatsapp" href={whatsappHref(settings)} size="lg">
              Message on WhatsApp
            </SocialButton>
          </div>

          <p className="mt-4 max-w-xs text-sm text-sand-200">
            Still curious? Send us a message on Instagram and we&apos;ll get back to you.
          </p>
        </div>
      </div>
    </aside>
  );
}
