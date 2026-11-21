import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { PiArrowDown, PiCalendarBlank, PiMapPin, PiPawPrint } from "react-icons/pi";
import { Birds } from "@/components/decor/Birds";
import { Lighthouse } from "@/components/decor/Lighthouse";
import { Palm } from "@/components/decor/Palm";
import { Waves } from "@/components/decor/Waves";
import { ThemeDecor } from "@/components/themes/ThemeDecor";
import { SocialButton } from "@/components/ui/SocialButton";
import { buttonClass } from "@/components/ui/Button";
import { imagesFor } from "@/lib/content";
import type { CategoryId, ResolvedImage, SiteData } from "@/lib/types";
import s from "./hero/hero.module.css";
import { HeroMotion } from "./hero/HeroMotion";

const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

type Corner = "tl" | "tr" | "bl" | "br";

// Polaroid placement around the map: which corner, where, and its resting tilt.
const SCENES: { category: CategoryId; dir: Corner; place: string; tilt: number; depth: number }[] = [
  { category: "flea-market", dir: "tl", place: "-left-[4%] -top-[14%] sm:-left-[8%]", tilt: -8, depth: 26 },
  { category: "music-dance", dir: "tr", place: "-right-[3%] -top-[20%] sm:-right-[7%]", tilt: 7, depth: 34 },
  { category: "pets", dir: "bl", place: "-left-[5%] -bottom-[26%] sm:-left-[10%]", tilt: 6, depth: 30 },
  { category: "food", dir: "br", place: "-right-[2%] -bottom-[22%] sm:-right-[6%]", tilt: -7, depth: 22 },
];

function sceneFor(data: SiteData, hero: ResolvedImage[], category: CategoryId) {
  return (
    hero.find((img) => img.category_id === category) ??
    data.images.find((img) => img.placement === "gallery" && img.category_id === category)
  );
}

export function HeroScrollZoom({ data }: { data: SiteData }) {
  const { content, settings, edition, categories } = data;
  const hero = imagesFor(data, "hero");
  const map = hero[0];
  const label = new Map(categories.map((c) => [c.id, c.label]));
  const city = edition.venue_city === "Visakhapatnam" ? "Vizag" : edition.venue_city;
  const titleWords = content.hero_title.split(/\s+/).filter(Boolean);
  const facts = [
    { icon: PiCalendarBlank, text: "Once every month" },
    { icon: PiMapPin, text: `${edition.venue_name}, ${city}` },
    { icon: PiPawPrint, text: "Family & pet friendly" },
  ];
  const scenes = SCENES.map((s) => ({ ...s, image: sceneFor(data, hero, s.category) })).filter(
    (s): s is typeof s & { image: ResolvedImage } => Boolean(s.image),
  );

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-clip bg-surface">
      <HeroMotion className="relative flex min-h-svh flex-col lg:h-svh lg:min-h-[46rem]">
        {/* Sky → sea → shore. The front wave below hands over to the Experience section's sand. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--color-sand-100)_0%,var(--color-sand-50)_34%,var(--color-sea-50)_58%,var(--color-sea-100)_76%,var(--color-sea-200)_100%)]"
        />
        <div data-hero="sun" aria-hidden="true" className="absolute right-[5%] top-[9%] -z-10 sm:right-[16%] sm:top-[16%] lg:right-[30%] lg:top-[12%]">
          <div className="size-28 rounded-full bg-terracotta-200/60 blur-2xl lg:size-56" />
          <div className="absolute inset-0 m-auto size-14 rounded-full bg-terracotta-300/80 lg:size-24" />
        </div>

        <ThemeDecor theme={edition.theme} slot="hero">
          <div data-hero="birds" aria-hidden="true" className="absolute right-[6%] top-[19%] w-24 text-sea-700 sm:right-[4%] sm:top-[9%] sm:w-36 lg:left-[40%] lg:right-auto lg:w-52">
            <Birds count={4} />
          </div>
          <div aria-hidden="true" className="absolute right-[6%] top-[26%] hidden w-28 text-sea-600 lg:block">
            <Birds count={3} />
          </div>
        </ThemeDecor>

        {/* Desktop: the lighthouse stands in the right margin, clear of the collage; palms sit half off-screen so they frame without covering copy. */}
        <div
          data-hero="lighthouse"
          aria-hidden="true"
          className="absolute bottom-[9%] right-[3%] h-[26%] lg:-right-12 lg:bottom-[12%] lg:h-[44%]"
        >
          <Lighthouse className="h-full w-auto" />
        </div>

        <div
          data-hero="palm-l"
          aria-hidden="true"
          className="absolute -left-14 bottom-[3%] z-0 h-[30%] text-sea-800 sm:-left-10 lg:-left-28 lg:z-10 lg:h-[42%]"
        >
          <Palm className="h-full w-auto" />
        </div>
        <div
          data-hero="palm-r"
          aria-hidden="true"
          className="absolute -right-16 bottom-[2%] z-0 h-[24%] text-sea-800 lg:-right-40 lg:z-30 lg:h-[52%]"
        >
          <Palm className="h-full w-auto" flip delay={1.2} />
        </div>

        <div className="container-site relative z-20 grid flex-1 items-center gap-20 pb-40 pt-28 sm:pb-44 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-12 lg:pb-28 lg:pt-24">
          <div data-hero="copy" className="flex flex-col items-start gap-5">
            <p
              className={`${s.fade} font-display text-sm uppercase tracking-[0.22em] text-terracotta-800 sm:text-base`}
              style={delay(0)}
            >
              Once a month · Sundays · By the sea
            </p>
            <h1 id="hero-title" aria-label={content.hero_title} className="font-serif text-hero tracking-tight text-sea-800">
              <span aria-hidden="true">
                {titleWords.map((word, i) => (
                  <Fragment key={`${word}-${i}`}>
                    <span className={s.word}>
                      <span className={s.wordInner} style={delay(0.12 + i * 0.12)}>
                        {word}
                      </span>
                    </span>
                    {i < titleWords.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </span>
            </h1>
            {content.hero_eyebrow ? (
              <p
                className={`${s.fade} -mt-2 font-serif text-2xl italic text-terracotta-800 sm:text-3xl`}
                style={delay(0.45)}
              >
                {content.hero_eyebrow}
              </p>
            ) : null}
            {content.hero_tagline ? (
              <p className={`${s.fade} max-w-xl text-lg text-ink-muted sm:text-xl`} style={delay(0.55)}>
                {content.hero_tagline}
              </p>
            ) : null}
            <div className={`${s.fade} flex flex-wrap gap-3 pt-1`} style={delay(0.65)}>
              <SocialButton platform="instagram" href={settings.instagram_url} size="lg">
                Follow for updates
              </SocialButton>
              <a href="#apply-vendor" className={buttonClass("outline", "min-h-14 bg-surface-card/80 px-7")}>
                Become a vendor
              </a>
            </div>
            <div className={s.fade} style={delay(0.75)}>
              <ul className="flex flex-wrap gap-2 pt-1" aria-label="At a glance">
                {facts.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface-card/80 px-3.5 py-2 text-sm font-medium text-ink shadow-soft backdrop-blur-sm"
                  >
                    <Icon aria-hidden="true" className="size-[1.1rem] text-terracotta-700" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {map ? (
            <div
              className={`${s.pop} relative mx-auto w-[86%] max-w-[34rem] sm:w-[78%] lg:ml-0 lg:w-full lg:max-w-[30rem]`}
              style={delay(0.3)}
            >
              <div data-hero="map" className="relative z-10" style={{ transform: "rotate(-3deg)" }}>
                <div data-depth="12">
                  <div
                    data-hero="chrome"
                    aria-hidden="true"
                    className="absolute -inset-2.5 -bottom-12 rounded-xl bg-surface-card shadow-lift sm:-inset-3 sm:-bottom-14"
                  >
                    <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-3 sm:bottom-4">
                      <span className="font-display text-xs uppercase tracking-[0.2em] text-terracotta-800 sm:text-sm">
                        The venue map
                      </span>
                      <span className="truncate font-serif text-base italic text-sea-800 sm:text-lg">
                        {edition.venue_name}, {city}
                      </span>
                    </div>
                    <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-4deg] bg-sand-300/70" />
                  </div>
                  <div
                    data-hero="map-img"
                    className="relative overflow-hidden rounded-lg"
                    style={{ aspectRatio: `${map.width ?? 1414} / ${map.height ?? 1000}` }}
                  >
                    <Image
                      src={map.url}
                      alt={map.alt}
                      fill
                      preload
                      quality={75}
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {scenes.map(({ category, dir, place, tilt, depth, image }) => (
                <div key={category} data-hero="pol" data-dir={dir} className={`absolute z-20 w-[34%] sm:w-[31%] ${place}`}>
                  <div data-float>
                    <div data-depth={depth}>
                      <figure
                        className="relative bg-surface-card p-1.5 pb-8 shadow-card sm:p-2 sm:pb-9"
                        style={{ transform: `rotate(${tilt}deg)` }}
                      >
                        <span aria-hidden="true" className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 rotate-[3deg] bg-sand-300/70" />
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 13vw, 30vw" className="object-cover" />
                        </div>
                        <figcaption className="absolute inset-x-1 bottom-1.5 truncate text-center font-serif text-sm italic text-sea-800 sm:bottom-2 sm:text-base">
                          {label.get(category) ?? ""}
                        </figcaption>
                      </figure>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div
          data-hero="inside"
          aria-hidden="true"
          className="pointer-events-none invisible absolute inset-x-0 top-[40%] z-40 flex flex-col items-center gap-2 text-center opacity-0"
        >
          <p className="font-display text-base uppercase tracking-[0.3em] text-sand-100">Step inside</p>
          <p className="font-serif text-4xl italic text-sand-50 sm:text-5xl [text-shadow:0_2px_24px_rgb(0_33_46/0.7)]">the market</p>
          <PiArrowDown className="mt-2 size-7 text-sand-50" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-40 h-0">
          <Waves edge="top" colors={["text-sea-200", "text-sea-300", "text-surface"]} />
        </div>
      </HeroMotion>
    </section>
  );
}
