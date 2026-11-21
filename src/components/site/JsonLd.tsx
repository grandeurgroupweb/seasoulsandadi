import { SITE_URL } from "@/lib/site-url";
import type { SiteData } from "@/lib/types";

// Admin-entered text ends up here, so "<" is escaped to keep it from closing the script tag.
function serialize(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: SiteData }) {
  const { settings, edition } = data;
  const sameAs = [settings.instagram_url, settings.facebook_url].filter(Boolean);
  const telephone = `+${settings.phone_display.replace(/\D/g, "")}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sea Soul Sandadi",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    email: settings.email,
    telephone,
    sameAs,
    areaServed: { "@type": "City", name: "Visakhapatnam" },
  };

  const event =
    edition.date_announced && edition.event_date
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: `Sea Soul Sandadi — ${edition.title}`,
          description:
            "A Sunday flea market by the sea in Vizag: curated local brands, slow food, live acoustic music, workshops, families and pets.",
          startDate: edition.event_date,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: edition.venue_name,
            address: {
              "@type": "PostalAddress",
              ...(/mgm/i.test(edition.venue_name) ? { streetAddress: "MGM Lawns, Beach Road" } : {}),
              addressLocality: edition.venue_city || "Visakhapatnam",
              addressRegion: "Andhra Pradesh",
              addressCountry: "IN",
            },
          },
          image: [`${SITE_URL}/og.jpg`],
          organizer: { "@type": "Organization", name: "Sea Soul Sandadi", url: SITE_URL },
        }
      : null;

  // Google rarely shows FAQ rich results now, but AI answer engines read this markup.
  // Same questions and answers as the visible FAQ section, nothing extra.
  const faq = data.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(organization) }} />
      {event ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(event) }} /> : null}
      {faq ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(faq) }} /> : null}
    </>
  );
}
