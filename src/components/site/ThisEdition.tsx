import { PiMapPin, PiNavigationArrow } from "react-icons/pi";
import { Waves } from "@/components/decor/Waves";
import { LinkButton } from "@/components/ui/Button";
import { RevealText } from "@/components/ui/RevealText";
import { SocialButton } from "@/components/ui/SocialButton";
import type { SiteData } from "@/lib/types";
import { EditionScenery } from "./edition/EditionScenery";
import { VenueVideo } from "./edition/VenueVideo";
import { Reveal } from "./sections/Reveal";

// Travelling terracotta light on the panel edge; @property lets the conic angle animate.
const GLOW_CSS = `
@property --edition-angle { syntax: "<angle>"; inherits: true; initial-value: 0deg; }
.edition-glow { position: relative; isolation: isolate; border-radius: var(--radius-xl); padding: 1.5px; background: var(--color-sea-600); animation: edition-spin 7s linear infinite; }
.edition-glow::before, .edition-glow::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: conic-gradient(from var(--edition-angle), transparent 0deg 250deg, var(--color-terracotta-400) 300deg, var(--color-terracotta-100) 330deg, var(--color-terracotta-500) 348deg, transparent 360deg); }
.edition-glow::before { z-index: -1; }
.edition-glow::after { z-index: -2; inset: -2px; filter: blur(16px); opacity: 0.55; }
.edition-badge { animation: edition-pulse 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
@keyframes edition-spin { to { --edition-angle: 360deg; } }
@keyframes edition-pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-terracotta-400) 60%, transparent); } 70%, 100% { box-shadow: 0 0 0 16px transparent; } }
@media (prefers-reduced-motion: reduce) { .edition-glow, .edition-badge { animation: none; } }
`;

function formatEventDate(isoDate: string) {
  // Noon IST keeps the calendar day stable regardless of the server's timezone.
  const date = new Date(`${isoDate}T12:00:00+05:30`);
  if (Number.isNaN(date.getTime())) return null;
  const part = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", { ...opts, timeZone: "Asia/Kolkata" }).format(date);
  return { dayMonth: part({ day: "numeric", month: "long" }), weekday: part({ weekday: "long" }) };
}

export function ThisEdition({ data }: { data: SiteData }) {
  const { edition, settings, content } = data;
  const date = edition.date_announced && edition.event_date ? formatEventDate(edition.event_date) : null;
  const highlights = edition.highlights
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);
  const venue = [edition.venue_name, edition.venue_city].filter(Boolean).join(", ");
  // The landmark comes from the owner's venue banner and only applies to MGM Lawns.
  const landmark = /mgm/i.test(edition.venue_name) ? "Beach Road, next to the Light House" : null;

  return (
    // z-10 so the wave edges, which spill over the neighbouring sections' padding, paint above them.
    <section id="edition" aria-labelledby="edition-title" className="on-dark relative z-10 py-20 sm:py-24 lg:py-28">
      <style href="edition-glow" precedence="default">
        {GLOW_CSS}
      </style>
      <Waves edge="top" colors={["text-sea-200", "text-sea-500", "text-sea-800"]} />
      <Waves edge="bottom" colors={["text-sea-200", "text-sea-600", "text-sea-800"]} />
      <EditionScenery theme={edition.theme} />
      <div className="container-site relative grid items-center gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20 xl:gap-24">
        <Reveal className="order-last lg:order-first">
          <VenueVideo />
        </Reveal>

        <Reveal>
          <div className="edition-glow shadow-lift">
            <div className="flex flex-col items-center gap-7 rounded-[calc(var(--radius-xl)-1.5px)] bg-sea-900 px-6 py-10 text-center sm:px-12 sm:py-14 lg:items-start lg:text-start">
              <div className="flex flex-col gap-3">
                <p className="font-display text-lg uppercase tracking-[0.12em] text-terracotta-300">
                  {content.edition_title}
                </p>
                <RevealText
                  as="h2"
                  id="edition-title"
                  text={edition.title}
                  className="font-serif text-section tracking-tight text-sand-50"
                />
              </div>

              {date ? (
                <p className="flex flex-col gap-1">
                  <time
                    dateTime={edition.event_date ?? undefined}
                    className="font-display text-5xl uppercase tracking-wide text-sand-50 sm:text-6xl"
                  >
                    {date.dayMonth}
                  </time>
                  <span className="text-lg text-sand-100">{date.weekday}</span>
                </p>
              ) : (
                <p className="edition-badge rounded-pill bg-terracotta-500 px-7 py-3.5 font-display text-xl uppercase tracking-[0.08em] text-ink-deep sm:text-2xl">
                  Date Announcing Soon
                </p>
              )}

              {venue ? (
                <div className="flex items-start gap-3 text-start">
                  <PiMapPin aria-hidden="true" className="mt-1 size-7 shrink-0 text-terracotta-300" />
                  <div className="flex flex-col">
                    {edition.map_url ? (
                      <a
                        href={edition.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-sand-50 underline decoration-terracotta-300 decoration-2 underline-offset-4 hover:decoration-sand-50"
                      >
                        {venue}
                        <span className="sr-only"> (opens map in a new tab)</span>
                      </a>
                    ) : (
                      <span className="text-xl font-semibold text-sand-50">{venue}</span>
                    )}
                    {landmark ? <span className="text-base text-sand-200">{landmark}</span> : null}
                  </div>
                </div>
              ) : null}

              {edition.map_url ? (
                <LinkButton href={edition.map_url} external variant="outline-light" className="w-full sm:w-auto">
                  <PiNavigationArrow aria-hidden="true" className="size-5" />
                  Get directions
                  <span className="sr-only"> (opens Google Maps in a new tab)</span>
                </LinkButton>
              ) : null}

              {highlights.length > 0 ? (
                <ul className="flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="What's on">
                  {highlights.map((item) => (
                    <li
                      key={item}
                      className="rounded-pill border border-sea-600 bg-sea-800 px-4 py-1.5 text-sm font-semibold text-sand-100"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="flex w-full flex-col items-center gap-3 lg:items-start">
                <SocialButton
                  platform="instagram"
                  href={settings.instagram_url}
                  size="lg"
                  className="w-full justify-center sm:w-auto"
                >
                  Follow for updates
                </SocialButton>
                <p className="text-sm text-sand-200">
                  Dates and tickets are announced on{" "}
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sand-50 underline underline-offset-4"
                  >
                    Instagram
                  </a>{" "}
                  and{" "}
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sand-50 underline underline-offset-4"
                  >
                    Facebook
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
