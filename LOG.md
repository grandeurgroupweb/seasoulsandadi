# Sea Soul Sandadi — work log

Handoff notes so the next person or session can pick up without re-reading the chat. Newest status first, history below. Last updated: 2026-11-20.

## Where things stand (read this first)

- **Full project brief:** `AGENT.md` (what it is, stack, design system, every section, data flow, rules, history, status). Codex: also `CODEX.md`. Claude Code: `CLAUDE.md`.
- The public site and the admin panel are built and run locally (`npm run dev` in `site/` → http://localhost:3000, admin at `/admin/login`). Checked at 1440 / 768 / 390 px.
- Last checks: `tsc` + `npm run lint` clean on 2026-11-20; full `npm run build` (passes, homepage JS ≈ 294 KB gzipped) and impeccable scan on 2026-11-17.
- **Pushed to GitHub 2026-11-21:** `grandeurgroupweb/seasoulsandadi`, branch `main`, commit `5b816da` (200 files). `dilipsai67` is a collaborator and pushes with plain `git push`. Still ask the owner before each commit/push.
- **Supabase project does not exist yet.** The site runs on built-in fallback content (`src/data/fallback.ts` + photos in `public/seed/`). Admin login, uploads and saves are untested end to end.
- **Theme layer is built** (Sankranti kites & candle lanterns, on locally via `fallback.ts`). How it works and how to remove/add a theme: `docs/THEME-PLAN.md`. Edition is now **January Edition** (2026-11-21; `fallback.ts`, `seed.sql`, admin hints), date still "Announcing Soon". No theme text on the site until the owner gives wording.
- **Supabase note:** run `supabase/migrations/20261120000000_edition_theme.sql` with the init migration; without it, saving the edition form fails on the unknown `theme` column.
- Standing rules worth repeating: no "Book Tickets" button or prices; strict 3-colour palette (brand logos excepted); never invent claims; never use impeccable's Live mode / Apply.

## Floating contact buttons (2026-11-21)

- `components/site/ContactDock.tsx`, rendered in `page.tsx`: fixed bottom-right, always visible. Call button (terracotta with white ring, plain filled handset icon) → `tel:` from `phone_display`; WhatsApp button (white, official logo, soft pulse) → `wa.me/<whatsapp_number>` with "Hi Sea Soul Sandadi!". Labels slide out on hover/focus. z-40 (same as header; the apply dialog sits above in the top layer).

## SEO fixes (2026-11-21)

- Keyword research (Google autocomplete, India): people search "events in vizag today/this weekend", "flea market in vizag", "sunday market vizag", "exhibition in vizag beach road", "beach events in vizag", "live music in vizag today", "pet friendly places in vizag", "kite festival vizag 2026", "mgm lawns vizag". Added to the copy: "Beach Road" in the venue line, footer, meta description and Event JSON-LD (`streetAddress`); "flea market" + "Vizag" in Experience intro, footer about and the new "Be a Part of" text (now covers vendors, volunteers and sponsors). `fallback.ts` + `seed.sql` both updated. Owner confirmed (2026-11-21) that MGM Lawns is on Beach Road. Waiting on owner: real answers for timings / entry fee / parking FAQs; Sankranti wording for January.

- Title → "Sea Soul Sandadi — Sunday Flea Market by the Sea, Vizag"; description, OG/Twitter and Event JSON-LD descriptions now say "flea market" + Vizag/MGM Lawns. FAQ counters ("01") are `aria-hidden` so headings read as the question. New `FAQPage` JSON-LD from the published FAQs. Edition is "January Edition".
- Still open from the audit: Event start/end time + street address/pin code (owner to provide); "Be a Part of" body copy covering volunteers/sponsors; after launch set `NEXT_PUBLIC_SITE_URL`, redirect `*.vercel.app`, Search Console + sitemap, Google Business Profile, website link in Instagram/Facebook bios; PageSpeed on the live URL.

## Apply forms + new WhatsApp number (2026-11-21)

- WhatsApp number is now **919573435222** (`fallback.ts`, `seed.sql`; admin Settings can change it). The contact phone (footer "Say hello", tel: link, Organization JSON-LD) was changed to +91 95734 35222 as well; the old 35111 number is no longer used anywhere.
- "Be a Part of Sea Soul Sandadi" (`VendorCTA`) has three buttons, no WhatsApp logo: Apply as a Vendor / Volunteer / Sponsor. Each opens a form dialog (`components/site/apply/ApplyDialog.tsx`, fields in `apply/roles.ts`); "Send" opens WhatsApp to that number with the filled details as the message. The hero "Become a vendor" button opens the vendor form too. Dialog follows the URL hash (`#apply-vendor|volunteer|sponsor`), so links can be shared. Required fields block sending. Checked at 1440 and 390; tsc + lint clean.
- The three buttons are now cards (`apply/ApplyCards.tsx`): icon tile, title, one-line subtitle, arrow; terracotta / sea / cream; lift, light sweep and arrow nudge on hover. Body text now covers all three roles.

## January / Sankranti + footer beach (2026-11-20)

- **2026-11-21, lanterns + kites across the whole page:** new `page` theme slot → `themes/sankranti/PageSky.tsx`, a fixed layer with sky-lanterns floating up and kites crossing (owner's reference photo; lantern redrawn as a glowing paper cylinder). Hidden under reduced motion.
- **2026-11-21, CSS-module bug fixed (affected the hero too):** the Turbopack rule in `next.config.ts` matched `*.css` and re-emitted every file `as: "*.css"`, so all `*.module.css` classes rendered as `undefined` (hero word/fade entrance and all theme motion were silently off, probably since 2026-11-17). Rule now matches `globals.css` only; module classes and Tailwind both verified.

- **This Edition button:** "Get directions" (venue map link `https://maps.app.goo.gl/jAHJsyymcbuvB1Ws5`, now the default `map_url` in `fallback.ts` + `seed.sql`; admin can change it). An "Add to calendar" button was built and then removed on 2026-11-21 at the owner's request (timings to come later).

- **Sankranti theme built** as a removable layer: `src/components/themes/` (registry + `ThemeDecor` slots `hero` / `edition` / `follow` / `footer`, each wrapping the old gulls as the coastal fallback) and `themes/sankranti/` (kites with fluttering tails, rising candle sky-lanterns, hanging-lantern garlands; CSS module animation, still under reduced motion). New `editions.theme` column + admin "Seasonal decor" dropdown. Bonfire left out (owner named kites + lanterns). Checked at 1440 and 390 (no horizontal scroll); removal test (folder + registry line deleted) passes tsc + lint. Full build not re-run.

- Owner: next edition moves to **January** (Sankranti), date still "Announcing Soon". The theme becomes **kites, candle lanterns and bonfire music**, built as a removable layer (all theme code in `src/components/themes/sankranti/` behind a generic `ThemeDecor` slot, so it can be deleted cleanly) **after** the owner's final-version changes. No theme text on the site until the owner gives the wording. Edition data still says November; switch it when the owner asks.
- Final-version change 1, footer: the bottom scene is now a beach. Sea strip, foam line and two sand dunes (`sand-300` / `sand-200` = `#ecdfc8`), seated people silhouettes (new `components/decor/BeachPeople.tsx`: couple, family, person with dog; fewer on phones), lighthouse standing on the dune at the right, palms and gulls kept. The copyright line sits on a sand pill (sea-900 text) so it stays readable over the palms. Desktop grid is `lg:grid-cols-[minmax(0,24rem)_auto_auto] lg:justify-between`, so the three columns (about, Explore, Say hello) have equal gaps (~110 px at 1366) instead of a big hole on one side. Checked at 1440 / 768 / 390, no horizontal scroll; tsc + lint clean.

- Final-version change 2, hero zoom on phones/tablets: the venue-map zoom ("Step inside the market") used to run only at ≥1024 px. It now runs at every width (`hero/HeroMotion.tsx`). The pin starts at `bottom bottom` (hero bottom meets the screen bottom), so the hero always fills the screen while pinned even when it is taller than the phone screen; on desktop that is the same moment as before, so desktop is unchanged. Pin length 110% desktop / 90% below. "Step inside" overlay now shows on all widths; the map image uses `sizes="100vw"` so it stays sharp when zoomed. Checked at 375 / 768 / 1440: zooms, then releases cleanly into The Experience; reduced motion still static. tsc + lint clean.

## Photo curation (2026-11-20)

Owner added ~96 photos to `../event images/` (134 files). Every photo, new and previously used, was reviewed; only strong ones kept. Rebuilt `public/seed/{gallery,hero,vendor,reel}` and `src/data/seed-manifest.ts`.

- Now: hero 5 (night venue map + 4 scene photos the hero actually uses: flea-market, music-dance, pets, food), gallery 30, vendor 8, reels 8. Gallery per category: flea-market 6, food 4, music-dance 5, pets 5, workshops 4, photo-moments 5, aerial 1. 38 distinct source photos, 28 of them from the new batch.
- Gaps closed: workshops/activities now has real shots (kids drawing, craft table, painting table, RC-car track); photo-moments has families and portraits.
- Removed (blurry/awkward/duplicate/weaker): kids-in-stroller close-up, back-of-head dog shot, craft-supplies table, rotated-crop dandiya extras, the weaker band/stage shots, older food and stall shots replaced by better ones, unused hero entries (October layout render, both aerials, workshop/photo-moment scenes). 44 files deleted.
- Gotcha: many new Canon files are stored sideways with **no EXIF rotation flag** (camera auto-rotate was off). They were rotated 90° counter-clockwise by hand (list in the curation script). ffmpeg ignores EXIF orientation on this machine, so export with Pillow (`ImageOps.exif_transpose`) when adding photos manually.
- Excluded: raw DJI `.DNG` files (unprocessed, flat/dark), `DJI_0866` night aerial (too dark), WhatsApp jpeg (low-res), duplicates `012A0846(1)`, `DJI_0773(1)`.
- Size: 6.9 MB total for those four folders (was 8.8 MB). tsc + lint clean; all 51 manifest paths return 200; checked at 1440 and 390.

## Owner photos + children's workshops (2026-11-20)

- Owner sent two photos in chat; originals saved to `event images/` as `art-stall-painted-bottles.jpg` and `caricature-artist-stall.jpg`.
- `public/seed/gallery/art-stall-bottles.webp` (flea-market, also in `vendor/`, replacing the plain bunting-stall print `012a1358`, so the polaroid line stays at 8) and `public/seed/gallery/caricature-artist.webp` (workshops, 900×1600 kept at native size — WhatsApp-compressed source). Manifest sort orders renumbered: hero 5, gallery 32, vendor 8, reel 8.
- Owner confirmed children's workshops: workshops category description now "Hands-on workshops for children and grown-ups…", and edition highlights add "Kids' Workshops" (`fallback.ts`, `seed.sql`, `docs/DATA-MODEL.md`).

## Hydration warning fix (2026-11-20)

The dev overlay showed "A tree hydrated but some attributes… didn't match" on `<html>`. Cause: the owner's Chrome extensions (Grammarly, Liner) inject `data-gr-*` / `data-liner-*` / `data-be-installed` attributes before React hydrates — not a site bug. Fix: `suppressHydrationWarning` on `<html>` and `<body>` in `src/app/layout.tsx` (covers only those two elements' attributes; real mismatches inside the page still surface).

Next agreed step: the owner makes their final-version changes, then the Kites & Lanterns theme layer is built on top (plan in the session plan file; summary: reusable `editions.theme`, admin dropdown, kites/lanterns decor, day→night hero).

## Handoff docs (2026-11-18)

Added `AGENT.md` (full project brief for any agent/developer) and `CODEX.md` (working guide for OpenAI Codex: read order, rules, Next 16 traps, verification loop, skill equivalents). `AGENTS.md` (auto-read by Codex) now points to both, outside the block `next dev` rewrites. When status changes, update `LOG.md` and the status section (§9) of `AGENT.md`.

## Redesign round 3 (2026-11-17 evening) — coastal kit

Owner asked for coconut trees, lighthouse, birds, wave footer, wavy edition band, moving text, different carousel controls, Follow Us beside the FAQ, real company logos on social buttons, and a fully new hero ("impress me").

Done (tsc + lint + production build clean; checked at 1440 / 768 / 390; no horizontal scroll at 360/390/768; homepage JS ≈ 294 KB gzipped):
- Shared kit: `components/decor/` Palm, Lighthouse, Birds, Waves (SVG, `decor-*` animations in globals.css); `components/ui/BrandLogos` + `SocialButton` (official Instagram/Facebook/WhatsApp colours — owner-approved palette exception, noted in CLAUDE.md); `components/ui/RevealText` + `useArmedReveal` (text visible by default, animates only content below the fold at load — safe without JS). `SectionHeading` animates every section title and supports an Anton `kicker`.
- Hero rebuilt: bright sky-to-sea scene, sun, gulls, lighthouse, palms, waves; DM Serif H1 with CSS word-rise; logo CTAs; fact chips; venue-map postcard with 4 pinned polaroids. Desktop (≥1024) only: 110% pinned scroll that zooms the map full-screen ("Step inside the market"). No pin on tablet/phone — the old blank-screen bug is gone.
- This Edition: wavy sea band with palms, gulls, lighthouse silhouette.
- Carousel controls: reels → Instagram-Stories progress bar + glass arrows; vendor polaroids → rope scrubber with clothes-peg knob + tag buttons; gallery → glass arrows.
- FAQ beside a sticky brush-edged Follow Us card (logo buttons); footer with animated waves + lighthouse/palm/gull coast scene; header Follow uses the Instagram logo.
- Fixed: Instagram logo blank on phones (gradient now CSS), 1px horizontal scroll (FAQ section clips the card's offset shadow).
- impeccable scan: only remaining hits are 6 "cyan gradient" warnings — the sea-blue text scrims on the Experience panels; the sea colour is the owner's brand colour, so left as is.

## Redesign round 2 (2026-11-17 afternoon)

Owner review asked for: hero fully redesigned, brand name in the nav, DM Serif headings, Poppins body, Anton (for an "Impact" look), animated text.

Done (lint + tsc clean, checked at 1440 / 768 / 390):
- Fonts: DM Serif Display (`font-serif`, headings), Poppins (`font-sans`, body), Anton (`font-display`, short uppercase labels/numbers only). Kaushan Script and Figtree removed. `docs/UI-UX-GUIDE.md` updated.
- Nav: logo + "Sea Soul Sandadi" wordmark; floating glass pill with sliding active pill (full links from 1280 px, menu button below that).
- This Edition: Anton "THIS MONTH'S EDITION" kicker + serif "November Edition", big pulsing "DATE ANNOUNCING SOON" badge, "Next to the Light House", and the helicopter venue clip (`public/seed/video/venue.mp4|webm` + poster; static, not admin-editable yet).
- Spacing/contrast: alternating section backgrounds, tighter gaps, bigger polaroid/reels controls (Anton counters), lighter Experience rails, two-column FAQ on desktop. New `site_content` key `faq_intro` (types, admin schema, seed, fallback, docs).

Waiting on the owner:
- **Hero rebuild**: owner will paste 21st.dev prompts for **Zoom Parallax** (efferd) and **Text Reveal (Mask)** (soralabs). Plan: venue map centred with event photos around it, all zooming on scroll; masked word reveal on the H1 and every section heading. The current hero still leaves ~3 blank screens on tablet (768 px) — the rebuild replaces that code.
- Venue spelling confirmed by owner: "MGM Lawns" (next to the Light House).

## Premium-upgrade round (done)

The owner asked for a more premium look using 21st.dev components. Four upgrades, each built by a separate agent:

| Upgrade | Status | Files |
| --- | --- | --- |
| Experience as expanding photo panels (hover/tap expands; accordion on phones) | Done, default view screenshotted. **Hover, tap and keyboard not tested yet.** | `components/site/Experience.tsx`, `sections/ExperiencePanels.tsx` (replaced `ExperienceTabs.tsx`) |
| Vendor polaroids hanging on a string (drag, swing, autoplay 5 s) | Done, checked at 1440 and 390 px | `components/site/VendorCTA.tsx`, `sections/PolaroidLine.tsx` |
| Reels as 3D coverflow (autoplay 4.5 s, center card links to Instagram) + gallery edge fades and hover lift | Done, checked at 1440 and 390 px | `components/site/Reels.tsx`, `Gallery.tsx`, `carousel/ReelsCoverflow.tsx` |
| Floating glass pill header with sliding active indicator + glowing border on the edition card | Done in round 2 (see above) | `components/site/Header.tsx`, `header/**`, `ThisEdition.tsx` |

21st.dev is on the free tier: 2 code downloads per day. Both were used on 2026-11-17 (Hanging Polaroid Carousel #36189, Glassy Coverflow Carousel #40236). The other effects were built without downloads.

## Next steps, in order

1. Finish the header pill + edition glow (check the half-edited files first; run `npx tsc --noEmit`).
2. **Possible bug to check:** the header agent saw the page scrolled to the edition section (y≈5370) while the screenshot still showed the hero, which suggests the pinned GSAP hero may not release. Check `components/site/hero/HeroStage.tsx` ScrollTrigger `pin`/`end` in a real browser at desktop and phone widths. It may also have been a screenshot timing artefact.
3. Test Experience panel interactions (hover, tap, arrow keys, `#experience-food` deep link).
4. Review every section at 1440 and 390 px, then run `npm run lint`, `npm run build`, `npx impeccable detect src/` and `npx impeccable detect http://localhost:3000`.
5. Push to GitHub when the owner says so (needs `gh auth login` on this machine first).
6. Owner sets up Supabase and Vercel (steps in `docs/DEVELOPMENT.md`), then test admin flows end to end with `docs/TESTING.md`.

## Owner setup still needed

1. **Supabase:** create project; run `supabase/migrations/20261117000000_init.sql`, then `supabase/seed.sql` in the SQL editor; Auth → turn off sign-ups; create the admin user; insert that user's id into `public.admins`; put URL + keys in `site/.env.local`; run `npm run seed:images` to upload the photos.
2. **Vercel:** import the GitHub repo; add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. Never add the service-role key there.
3. **Content gaps:** workshops has only 1 photo, photo moments only 3. Upload more through the admin panel once it's live.

## Decisions made (do not re-open without the owner)

- Stack: Next.js 16 + React 19 + Tailwind 4 + Supabase + Vercel; GSAP for the hero only, `motion` for small transitions, Embla for the gallery. Started as a static Vite plan, switched when the admin panel was added.
- Colors: only `#d87459` terracotta, `#006994` sea, `#ecdfc8` sand (plus tints/shades, white, black).
- Fonts: Kaushan Script for big headings only, Figtree for everything else.
- No "Book Tickets" button, no ticket or stall prices. Tickets and announcements go through Instagram/Facebook `seasoulsandadi`. Vendor button opens WhatsApp 919573435111.
- Edition: single row, overwritten monthly (no history). Currently November, "Date Announcing Soon", MGM Lawns, Visakhapatnam.
- Admin: one owner account, email + password. Admin also edits page text (`site_content` table).
- Reels section: link-out cards to Instagram (no embeds yet); now shown as a 3D coverflow.
- Impeccable's Live mode / Apply feature must never be used (it bypasses permission checks). Standing owner decision.
- `CLAUDE.md` and `docs/` live inside `site/` so they ship with the repo; the root `CLAUDE.md` just imports `site/CLAUDE.md`.

## History

### Planning
- Read the source copy (`Sea_Soul_Sandadi_Presentation_With_Image_Placeholders.md`), the venue layout renders, drone shots and event photos; the owner shared a reference screenshot for layout ideas only.
- Agreed the section order: scroll-zoom hero from the venue layout into real photos → the experience by category → this edition → gallery → become a vendor → reels → FAQ → follow us/footer.

### Setup
- Installed skills globally: `design-taste-frontend` (taste-skill), `ui-ux-pro-max`, `impeccable` (its hooks are in `~/.claude/settings.json`).
- Scaffolded `site/` with create-next-app (Next 16.4.6, `cacheComponents` on).

### Docs (parallel agents)
- `docs/` PRD, FRD, DATA-MODEL, UI-UX-GUIDE, SECURITY, SITEMAP, SEO-STRATEGY, TESTING, DEVELOPMENT; `CLAUDE.md` with canonical names.

### Data and plumbing
- Supabase migration with row-level security (anyone can read published content; every write checks `is_admin()`), `media` storage bucket, seed data, TypeScript types.
- `src/lib/content.ts` loads everything with `'use cache'` + tag `site`; admin saves call `updateTag('site')` so changes appear immediately.
- `src/proxy.ts` guards `/admin`; security headers (CSP etc.) in `next.config.ts`.
- 57 photos categorized and compressed to WebP (8.8 MB) in `public/seed/`, listed in `src/data/seed-manifest.ts`; logo trimmed to `public/logo.webp`.

### Build (parallel agents)
- Header/footer/SEO (metadata, robots, sitemap, JSON-LD, OG image), hero scroll-zoom, gallery + reels, experience/edition/vendor/FAQ with a copy pass (humanizer), admin panel (login, gallery upload/reorder/delete, edition, FAQ, content, settings; photos resized in the browser before upload).

### Review fixes
- Hero crossfades: at most two photos visible, caption matches the photo.
- Carousel loop seam (cards touching) fixed; image sizes capped at 2048 px.
- Footer logo on a sand badge for contrast; vendor section bottom gap trimmed.
- Removed a generic "eyebrow" label above the hero title (flagged by impeccable).
- Rewrote README.md for the repo.

## Handy commands

```bash
cd site
npm run dev            # http://localhost:3000
npm run lint
npm run build
npx impeccable detect http://localhost:3000
```

Full-page screenshots without the browser pane (each section as a separate tile):

```bash
CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" node ~/.claude/skills/design-taste-frontend/scripts/shoot.mjs --url http://localhost:3000 --w 1440 --out shots/d.png --tiles shots/t --profile <temp folder>
```

Notes: there is no Docker on this machine, so Supabase can't run locally. The dev-server launch config is in the project root at `.claude/launch.json`.
