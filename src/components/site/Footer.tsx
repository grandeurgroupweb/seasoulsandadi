import Image from "next/image";
import { cacheLife } from "next/cache";
import { LuMail, LuPhone } from "react-icons/lu";
import { Waves } from "@/components/decor/Waves";
import { BrandLogo, type SocialPlatform } from "@/components/ui/BrandLogos";
import { whatsappHref } from "@/lib/content";
import type { SiteData } from "@/lib/types";
import { CoastScene } from "./footer/CoastScene";
import { NAV_LINKS } from "./header/nav";

// new Date() during prerender is an error under Cache Components, so the year is cached.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const linkClass =
  "inline-flex min-h-11 items-center text-base text-sand-100 underline-offset-4 hover:text-sand-50 hover:underline";

export function Footer({ data }: { data: SiteData }) {
  const { content, settings } = data;
  const tel = `tel:+${settings.phone_display.replace(/\D/g, "")}`;
  const socials: { platform: SocialPlatform; href: string; label: string }[] = [
    { platform: "instagram", href: settings.instagram_url, label: "Instagram" },
    { platform: "facebook", href: settings.facebook_url, label: "Facebook" },
    { platform: "whatsapp", href: whatsappHref(settings), label: "WhatsApp" },
  ];

  return (
    <footer id="contact" className="on-dark relative">
      {/* Front layer matches the .on-dark ground (sea-800) so the wave flows into the footer seamlessly. */}
      <Waves edge="top" colors={["text-sea-300", "text-sea-500", "text-sea-800"]} />

      <div className="container-site pt-12 sm:pt-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[minmax(0,24rem)_auto_auto] lg:justify-between lg:gap-x-12">
          <div className="flex flex-col gap-5">
            {/* The brown logo needs a light ground to read on the sea band. */}
            <div className="self-start rounded-lg bg-sand-100 px-4 py-3 shadow-soft">
              <Image src="/logo.webp" alt="Sea Soul Sandadi" width={512} height={276} sizes="148px" className="h-16 w-auto" />
            </div>
            <p className="max-w-sm text-base text-sand-100">{content.footer_about}</p>
            <ul className="flex gap-3">
              {socials.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid size-12 place-items-center rounded-pill bg-white shadow-soft transition-transform duration-300 ease-out-soft hover:-translate-y-1"
                  >
                    <BrandLogo platform={s.platform} className="size-6 transition-transform duration-300 ease-out-soft group-hover:scale-110" />
                    <span className="sr-only">{s.label} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer">
            <h3 className="font-display text-base uppercase tracking-[0.14em] text-sand-300">Explore</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 md:grid-cols-1">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-base uppercase tracking-[0.14em] text-sand-300">Say hello</h3>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <a href={`mailto:${settings.email}`} className={`${linkClass} gap-3 break-all`}>
                  <LuMail aria-hidden="true" className="size-5 shrink-0 text-terracotta-300" />
                  {settings.email}
                </a>
              </li>
              <li>
                <a href={tel} className={`${linkClass} gap-3`}>
                  <LuPhone aria-hidden="true" className="size-5 shrink-0 text-terracotta-300" />
                  {settings.phone_display}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm text-sand-300">MGM Lawns, Beach Road, next to the Light House · Visakhapatnam, Andhra Pradesh</p>
          </div>
        </div>

        <p className="mt-14 text-center font-serif text-3xl italic text-sand-50 sm:text-4xl lg:text-5xl">
          {content.footer_tagline}
        </p>
      </div>

      <CoastScene theme={data.edition.theme}>
        <p className="mx-auto w-fit rounded-pill bg-sand-200/90 px-3 py-1 text-center text-sm font-medium text-sea-900">© <CurrentYear /> Sea Soul Sandadi · Visakhapatnam, Andhra Pradesh</p>
      </CoastScene>
    </footer>
  );
}
