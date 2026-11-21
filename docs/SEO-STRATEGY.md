# SEO Strategy — Sea Soul Sandadi

Goal: when someone in or around Vizag searches for something to do on a Sunday, a market by the sea, or local brands, this page shows up with a clear title, a good preview image, and (once a date is set) an event rich result. One page, local intent, no keyword stuffing.

Implementation target: Next.js 16 App Router (`src/app/`). Read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` before writing metadata code.

## 1. Domain and `metadataBase`

```ts
// src/app/layout.tsx
// TODO(owner): replace with the custom domain once it is connected in Vercel.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://seasoulsandadi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...
};
```

- `NEXT_PUBLIC_SITE_URL` is set in Vercel once a domain exists. Until then the Vercel URL is canonical.
- When a custom domain is added, set the `*.vercel.app` URL to redirect to it in Vercel (Domains → Redirect) so only one host is indexed.

## 2. Root metadata (`src/app/layout.tsx`)

| Field | Value |
| --- | --- |
| `title.default` | `Sea Soul Sandadi — Sunday Flea Market by the Sea, Vizag` (55 chars; "flea market" added 2026-11-21 after the SEO audit) |
| `title.template` | `%s · Sea Soul Sandadi` |
| `description` | `A once-a-month Sunday flea market by the sea in Vizag at MGM Lawns, next to the Light House: local brands, slow food, live music, workshops, families and pets.` (159 chars) |
| JSON-LD | `Organization` always; `Event` once a date is announced; `FAQPage` mirroring the visible FAQ (added 2026-11-21) |
| `alternates.canonical` | `/` |
| `applicationName` | `Sea Soul Sandadi` |
| `category` | `events` |
| `icons` | `favicon.ico` + `icon.png` (logo, 512×512) + `apple-icon.png` (180×180) via file conventions in `src/app/` |
| `robots` | `{ index: true, follow: true }` |

### Open Graph

```ts
openGraph: {
  type: "website",
  locale: "en_IN",
  url: "/",
  siteName: "Sea Soul Sandadi",
  title: "Sea Soul Sandadi — Sunday Market by the Sea, Vizag",
  description: "Local brands, slow food, live acoustic music, workshops and pet-friendly spaces. Once a month, on a Sunday, by the sea in Visakhapatnam.",
  images: [{
    url: "/og.jpg",            // 1200×630 JPEG, < 300 KB
    width: 1200,
    height: 630,
    alt: "Aerial view of Sea Soul Sandadi at night: rows of lit white stalls by the beach in Visakhapatnam",
  }],
},
```

- `og.jpg` lives in `public/`. Crop it from the aerial drone shot (`DJI_0866.JPG`) or the lit night layout; brand mark optional, no text smaller than ~40 px.
- JPEG, not WebP: WhatsApp and some crawlers still render JPEG previews more reliably. WhatsApp is the main share channel here, so this matters.

### Twitter

```ts
twitter: {
  card: "summary_large_image",
  title: "Sea Soul Sandadi — Sunday Market by the Sea, Vizag",
  description: "Local brands, slow food, live music and workshops by the sea in Visakhapatnam. Once a month, on a Sunday.",
  images: ["/og.jpg"],
},
```

### Admin pages

`src/app/admin/layout.tsx` (covers login and every protected screen):

```ts
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};
```

## 3. `robots.ts` and `sitemap.ts`

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
```

Only `/` goes in the sitemap. Section anchors (`/#gallery` etc.) are not separate URLs and must not be listed.

`robots.txt` disallow is not access control. Admin is protected by auth + RLS (see `SECURITY.md`); `noindex` covers anything that leaks into a link.

## 4. Structured data (JSON-LD)

Render in `src/app/page.tsx` as `<script type="application/ld+json">` with `JSON.stringify(...)`, escaping `<` as `<` so admin-entered text cannot break out of the script tag.

### Organization (always)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Sea Soul Sandadi",
  "url": "<SITE_URL>",
  "logo": "<SITE_URL>/icon.png",
  "email": "<site_settings.email>",
  "telephone": "+91-95734-35111",
  "sameAs": ["<site_settings.instagram_url>", "<site_settings.facebook_url>"],
  "areaServed": { "@type": "City", "name": "Visakhapatnam" }
}
```

Email, phone and social URLs come from `site_settings`, so admin edits flow through.

### Event (only when a date is announced)

Emit only if `editions.date_announced === true && editions.event_date != null`. Never emit an Event with a placeholder date; Google penalises misleading event markup.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Sea Soul Sandadi — <editions.title>",
  "description": "A Sunday gathering by the sea: curated local brands, slow food, live acoustic music, workshops, families and pets.",
  "startDate": "<event_date>T11:00:00+05:30",
  "endDate": "<event_date>T21:00:00+05:30",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "<editions.venue_name>",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Visakhapatnam",
      "addressRegion": "Andhra Pradesh",
      "addressCountry": "IN"
    }
  },
  "image": ["<SITE_URL>/og.jpg"],
  "organizer": { "@type": "Organization", "name": "Sea Soul Sandadi", "url": "<SITE_URL>" }
}
```

- No `offers` block: tickets are announced on Instagram, there is no price on the site.
- Start/end times: the event has no stored time yet. Keep `startDate` as date-only (`"2026-11-29"`) unless the admin later gets a time field; date-only is valid. The example times above are illustrative only.
- Validate with Google's Rich Results Test after every change to this block.

### Not used

- No `FAQPage` markup: Google limits FAQ rich results to government/health sites, so it adds nothing. The FAQ stays as normal HTML.
- No `Review`/`AggregateRating`: there are no real reviews on the page and inventing them is against the content rules.

## 5. Target phrases and placement

Use each phrase where it reads naturally. If a sentence sounds forced, drop the phrase.

| Phrase | Where it lives |
| --- | --- |
| Sunday market Vizag | Meta title ("Sunday Market by the Sea, Vizag"), hero supporting line |
| flea market Visakhapatnam | FAQ "Is it a flea market?" (question + answer), Experience chip "Flea Market" description |
| beach market Vizag / by the sea | Hero H1 area, OG description, aerial image alt text |
| weekend events Vizag / things to do in Vizag on Sunday | Edition section intro, PRD-approved "Why" copy |
| local brands Vizag | Vendor section H2/intro ("local brands, makers and creators in Vizag") |
| pet friendly events Vizag | Experience chip "Pet-Friendly Space" description, pet photo alt text |
| live music Vizag | Experience chip "Live Music & Dance" description |

Use both "Vizag" and "Visakhapatnam": locals search with "Vizag", maps and schema use "Visakhapatnam".

## 6. Heading hierarchy

Exactly one `h1`, in the hero.

```
h1  Sea Soul Sandadi                         (hero)
  h2  The Experience                         (#experience)
    h3  Flea Market / Food Stalls / ...       (each category)
  h2  This Month's Edition                    (#edition)
  h2  Event Gallery                           (#gallery)
  h2  Be a Part of Sea Soul Sandadi           (#vendors)
  h2  From Our Instagram                      (#reels)
  h2  Frequently Asked Questions              (#faq)
    h3  each question (inside the accordion button)
  h2  Follow Us for Updates                   (#contact / footer)
```

- Section titles come from `site_content`; the heading *level* is fixed in code and never editable.
- The hero's large decorative script line, if any, is not a second `h1`.
- Accordion answers stay in the DOM when collapsed (hidden with `hidden`/height animation, not removed), so they remain crawlable.

## 7. Image alt text

Every image has an `alt` stored in `gallery_images.alt`; the admin upload form makes it required (min 8 chars) and shows these rules beside the field:

1. Describe what is in the photo: people, activity, setting. "Woman in a red saree dancing with dandiya sticks at Sea Soul Sandadi, Vizag."
2. Mention the place or activity when it fits, once. Don't append keyword lists.
3. Under ~125 characters.
4. Never start with "Image of" or "Photo of".
5. Purely decorative images (textures, dividers) use `alt=""` in code and are not uploaded through the gallery.

Seeded images get hand-written alt text in `src/data/fallback.ts` / seed data, following the same rules.

File names in Storage don't affect ranking enough to matter; keep them as generated IDs.

## 8. Performance that affects ranking

| Item | Rule |
| --- | --- |
| LCP | The first visible hero image uses `next/image` with `preload` (Next 16 replacement for `priority`) or `fetchPriority="high"`, plus accurate `sizes` (`"100vw"` for full-bleed). Only one image gets this. |
| Image format/size | `next/image` with Supabase `remotePatterns`; uploads already capped at 2000 px WebP. Quality stays at the default `75` (Next 16 default `qualities: [75]`). |
| Below the fold | Gallery, reels and vendor images use default `loading="lazy"`. Carousel clones (for infinite loop) never preload. |
| CLS | Every image has `width`/`height` (stored in `gallery_images`) or `fill` inside a sized box. Fonts via `next/font/google` (self-hosted, `display: "swap"`, size-adjusted fallback). Sticky header has a reserved height. |
| JS | GSAP/ScrollTrigger loads only in the hero client component; the rest of the page is server-rendered HTML so content is in the initial response. |
| Reduced motion | `prefers-reduced-motion` disables scroll-zoom and auto-scroll (good for users, and avoids long main-thread work). |
| Targets | Lighthouse mobile: Performance ≥ 85, SEO 100, Accessibility ≥ 95, Best Practices ≥ 95. LCP < 2.5 s, CLS < 0.1, INP < 200 ms. |

## 9. Rendering and freshness

- `/` is statically rendered and revalidated on demand: admin Server Actions call `revalidatePath("/")` after every change, so crawlers always get fresh, fully rendered HTML.
- If Supabase is unreachable at build/revalidate time, `src/lib/content.ts` falls back to `src/data/fallback.ts`, so the page never renders empty for a crawler.

## 10. Off-page

- **Google Business Profile**: create one as an event organiser/service-area business in Visakhapatnam, website = this site, add photos from the gallery, post each edition's date as a GBP Event once announced. This is the biggest local-search lever for "things to do in Vizag".
- **Instagram/Facebook**: put the site URL in both bios; use the same name ("Sea Soul Sandadi") and description everywhere (consistent NAP).
- **Listings**: submit each edition to local event listings (e.g. city event pages, Insider/district-style listings where the organiser chooses) with a link back.
- **Search Console**: verify the domain (DNS TXT in Vercel or the `verification.google` metadata field), submit `sitemap.xml`, watch the Enhancements → Events report once dates are announced.

## 11. Launch checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set in Vercel; `metadataBase` resolves to it
- [ ] Title ≤ 60 chars, description ≤ 155 chars, both render in page source
- [ ] `/og.jpg` is 1200×630, < 300 KB, previews correctly in WhatsApp and a link debugger
- [ ] `/robots.txt` disallows `/admin`; `/sitemap.xml` lists only `/`
- [ ] Every `/admin/*` response has `noindex, nofollow`
- [ ] Exactly one `h1`; section headings are `h2`, FAQ questions `h3`
- [ ] Organization JSON-LD valid in Rich Results Test
- [ ] Event JSON-LD absent while date is "Announcing Soon"; present and valid after the admin sets a date
- [ ] Every rendered image has non-empty, descriptive `alt` (except decorative `alt=""`)
- [ ] Hero image is the LCP element and preloaded; no other image preloads
- [ ] Lighthouse mobile meets the targets in §8
- [ ] Search Console verified, sitemap submitted
- [ ] Google Business Profile created and linked
- [ ] Instagram and Facebook bios link to the site
