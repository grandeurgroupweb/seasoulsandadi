# AGENT.md — Sea Soul Sandadi: full project brief

For any coding agent (Claude Code, Codex, Cursor, Copilot…) or developer picking this project up. Self-contained: read this first, then `LOG.md` for the latest status and `docs/` for detail. Last updated 2026-11-20.

---

## 1. What this is

**Sea Soul Sandadi** is a once-a-month Sunday gathering by the sea in Visakhapatnam (Vizag), India: curated local brands (flea market), slow food, live acoustic music and dance, workshops, families and pets. Current venue: **MGM Lawns, next to the Light House, Visakhapatnam**.

This repo is its **landing page + a private admin panel** so the owner can change photos, the edition date/venue, FAQs, page text and contact links without a developer.

- Public site `/` — one long, animated, fully responsive page.
- Admin `/admin` — one owner login (Supabase Auth, email + password).
- Data in Supabase (Postgres + Storage). Hosted on Vercel. Code at `github.com/grandeurgroupweb/seasoulsandadi` (public; this `site/` folder is the repo root).

Owner contact (public on the site): `seasoulsandadi@gmail.com`, `+91 95734 35222`, Instagram/Facebook `seasoulsandadi`.

## 2. Folder map

```
F:\office work\sea soul test\          (project root — NOT the git repo)
├── Sea_Soul_Sandadi_Presentation_With_Image_Placeholders.md   source copy (owner's deck text)
├── event images\                      raw photo library (10–40 MB camera files) — never edit, never commit
├── CLAUDE.md                          imports site/CLAUDE.md
├── .claude\launch.json                dev-server launch config (runs `npm --prefix site run dev`)
└── site\                              ← the app and the GitHub repo
    ├── AGENT.md  CODEX.md  CLAUDE.md  AGENTS.md  LOG.md  README.md
    ├── docs\         PRD, FRD, DATA-MODEL, UI-UX-GUIDE, SECURITY, SITEMAP, SEO-STRATEGY, TESTING, DEVELOPMENT
    ├── supabase\     migrations/20261117000000_init.sql, seed.sql
    ├── scripts\      seed-images.mjs (one-time photo upload to Supabase)
    ├── public\       logo.png/.webp, og.jpg, seed/{gallery,hero,vendor,reel,video}/  (optimized WebP + venue video)
    └── src\
        ├── app\                     layout.tsx (fonts, metadata), page.tsx (home), globals.css (tokens), robots.ts, sitemap.ts, icons
        │   └── admin\               login, (protected)/{gallery,edition,faq,content,settings}, signout route
        ├── proxy.ts                 auth guard for /admin (Next 16's renamed middleware)
        ├── components\
        │   ├── site\                public sections (see §5) + carousel/, edition/, follow/, footer/, header/, hero/, sections/
        │   ├── admin\               admin UI (AdminShell, forms, gallery manager, upload panel)
        │   ├── decor\               Palm, Lighthouse, Birds, Waves — coastal SVG illustration kit
        │   └── ui\                  Button, SectionHeading, RevealText, useArmedReveal, SocialButton, BrandLogos
        ├── lib\                     content.ts (data loader), types.ts, site-url.ts, supabase/{client,server,public,env}.ts, admin/{actions,schemas,auth,resize-image,…}
        └── data\                    fallback.ts (built-in content), seed-manifest.ts (57 seed photos)
```

## 3. Stack (settled — don't change without the owner)

| Area | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16.4.6** App Router, TypeScript, Turbopack | Newer than most training data — read `node_modules/next/dist/docs/` before using APIs. `middleware.ts` → **`proxy.ts`**; `cookies()/headers()/params` are **async**; `cacheComponents: true` is on (`'use cache'`, `cacheTag`, `updateTag`); `next/image` uses `preload` (not `priority`). |
| UI | **React 19.3**, **Tailwind CSS 4.3** | Tokens in `@theme` in `src/app/globals.css`; no `tailwind.config`. |
| Data/Auth/Files | **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) | RLS is the real security layer. |
| Animation | **GSAP 3** + `@gsap/react` (hero scroll only), **motion** 14 (`motion/react`) for reveals/accordion, CSS keyframes for decor loops | All respect `prefers-reduced-motion`. |
| Carousels | `embla-carousel-react` + `embla-carousel-auto-scroll` (gallery); custom code for reels coverflow and polaroid line | |
| Icons | `react-icons` (Phosphor `pi`, Lucide `lu`, Simple Icons `si`) | |
| Validation | `zod` 4 | |
| Hosting | Vercel | |
| Node | ≥ 22.18 (type-stripping is used by the seed script) | Machine has Node 25. |

## 4. Design system

- **Colours (strict):** terracotta `#d87459` (CTAs, accents), sea `#006994` (headings, dark bands), sand `#ecdfc8` (backgrounds) — plus tints/shades (`terracotta-50…950`, `sea-50…950`, `sand-50…950`), white and black. Semantic aliases: `ink`, `ink-deep`, `ink-muted`, `surface`, `surface-raised`, `surface-card`, `line`, `ring`.
  - **Only exception:** third-party brand logos keep official colours (Instagram gradient, Facebook `#1877F2`, WhatsApp `#25D366`) — only inside `components/ui/BrandLogos.tsx`, used via `SocialButton`.
  - Contrast rule: terracotta-500 fills take **ink-deep** text (white fails). Terracotta as text on sand: `-800` small, `-700` large only.
- **Fonts (owner's choice):** **DM Serif Display** (`font-serif`) for the H1, section headings, nav wordmark, italic accents; **Poppins** (`font-sans`, default, 400–700) for everything else; **Anton** (`font-display`, the owner's "Impact" look) only for short uppercase labels and numbers (counters, date badge, kickers). Loaded with `next/font/google` in `layout.tsx`.
- **Coastal illustration kit** (`components/decor/`): coconut `Palm` (swaying fronds), `Lighthouse` (colour or silhouette, sweeping beam), `Birds` (gliding/flapping gulls), `Waves` (layered drifting SVG waves for section edges). Colour via `text-*` classes; animations are `decor-*` keyframes in `globals.css`; reduced motion freezes them.
- **Motion:** every section title animates word-by-word on scroll (`SectionHeading` → `RevealText`); blocks fade up (`Reveal`). Both are **visible by default** and only animate content that is below the fold when the page loads (`useArmedReveal`) — so no-JS / slow phones never see blank text.
- Full spec: `docs/UI-UX-GUIDE.md`.

## 5. The public page, top to bottom (`src/app/page.tsx`)

| # | Section (component) | What it does |
| --- | --- | --- |
| 1 | **Header** (`Header` → `header/HeaderShell`) | Floating glass pill: logo + "Sea Soul Sandadi" wordmark, 7 anchor links with a sliding active pill (≥1280 px; menu button below), Instagram "Follow" with real logo. Accessible mobile menu. |
| 2 | **Hero** `#top` (`HeroScrollZoom` + `hero/HeroMotion`, `hero/hero.module.css`) | Bright sky-to-sea coastal scene (sun, gulls, lighthouse, palms, waves). Anton kicker, DM Serif H1 (CSS word-rise), eyebrow, tagline, Instagram + WhatsApp logo buttons, fact chips. Venue night-layout map as a taped postcard with 4 pinned polaroids. **Desktop ≥1024 only:** 110% pinned GSAP scrub zooms the map full-screen ("Step inside the market"). No pin on tablet/phone. |
| 3 | **The Experience** `#experience` (`Experience` → `sections/ExperiencePanels`) | Six expanding photo panels (flea market, food, music & dance, pets, workshops, photo moments); accordion on phones; deep links `#experience-<slug>`. Owner likes this one — leave it. |
| 4 | **This Edition** `#edition` (`ThisEdition` + `edition/EditionScenery`, `edition/VenueVideo`) | Wavy sea band with palms/gulls/lighthouse. Anton kicker + "November Edition", pulsing **DATE ANNOUNCING SOON** badge (or the date once announced), venue + "Next to the Light House", highlights, Instagram button, and the helicopter venue promo video (`public/seed/video/venue.*`). |
| 5 | **Event Gallery** `#gallery` (`Gallery` → `carousel/AutoScrollCarousel`, `GlassArrow`) | Infinite slow auto-scroll; pauses on hover/focus/touch; glass prev/next arrows; swipe. |
| 6 | **Become a Vendor** `#vendors` (`VendorCTA` → `sections/PolaroidLine`) | Stall photos as polaroids on a swinging clothesline; rope scrubber with clothes-peg knob; WhatsApp logo button (opens `wa.me/…` with prefilled text). No prices. |
| 7 | **From Our Instagram** `#reels` (`Reels` → `carousel/ReelsCoverflow`) | 3D coverflow of reel cards; Instagram-Stories progress bar drives autoplay; glass arrows; centre card links to Instagram. |
| 8 | **FAQ + Follow Us** `#faq` (`FAQ`, `sections/FaqAccordion`, `follow/FollowCard`) | Accordion (owner's 5 Q&As, verbatim) beside a sticky brush-edged sea card with Instagram/Facebook/WhatsApp logo buttons. |
| 9 | **Footer** `#contact` (`Footer` + `footer/CoastScene`) | Animated wave edge, logo, about, links, contact, social logos, tagline "Let's build a Sunday culture together.", lighthouse/palms/gulls shoreline. |
| — | `JsonLd` | Organization JSON-LD always; Event JSON-LD only once a date is announced. |

## 6. Data and content flow

- `src/lib/content.ts` → `getSiteData()` (`'use cache'`, tag `site`, `cacheLife('hours')`). Reads Supabase with the anon key via a cookie-free client. If Supabase env vars are missing or a query fails → `src/data/fallback.ts` (same content as `seed.sql`, photos from `public/seed/`). **The site works today with no Supabase at all.**
- Admin Server Actions (`src/lib/admin/actions/*`) validate with zod, re-check `is_admin()` server-side, write with the user's session (RLS applies), then `updateTag('site')` so the public page updates on the next request.
- Uploads: browser resizes/re-encodes to WebP (≤2000 px, strips EXIF; JPEG fallback on Safari) → uploads straight to Supabase Storage bucket `media` → Server Action inserts the row. Nothing large goes through Vercel (4.5 MB limit).

### Supabase schema (`supabase/migrations/20261117000000_init.sql`; detail in `docs/DATA-MODEL.md`)
- `admins(user_id)` + `is_admin()` (security definer). Every write policy checks it. Public sign-ups must be **disabled** in Supabase Auth.
- `categories` (slugs: `flea-market`, `food`, `music-dance`, `pets`, `workshops`, `photo-moments`)
- `gallery_images` (`storage_path`, `alt`, `category_id`, `placement` ∈ gallery/hero/vendor/reel, `link_url`, size, order, `is_published`)
- `editions` — single row `id=1` (overwritten monthly, no history): title, month, `event_date`, `date_announced`, venue, city, map URL, highlights
- `faqs`, `site_settings` (single row: WhatsApp number/message, Instagram, Facebook, email, phone), `site_content` (editable copy keys incl. `hero_*`, `experience_*`, `edition_title`, `gallery_*`, `vendor_*`, `reels_*`, `faq_title`, `faq_intro`, `follow_title`, `footer_*`)
- Storage bucket `media` (public read; admin-only writes; folders gallery/hero/vendor/reels/logo)

### Secrets
Runtime uses only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. `SUPABASE_SERVICE_ROLE_KEY` is used **only** by `scripts/seed-images.mjs` on a developer machine — never imported from `src/`, never in Vercel, never in git or chat. `.env*` is git-ignored except `.env.local.example`.

## 7. Rules that must not be broken

1. No "Book Tickets" button, no ticket prices, no vendor stall cost anywhere. Tickets/announcements go through Instagram/Facebook.
2. Vendor CTA → WhatsApp `https://wa.me/919573435222?text=…` (number editable in admin).
3. Never invent testimonials, quotes, numbers, awards or claims. Copy comes from the source `.md`, the FAQ text, and facts the owner gave.
4. Strict palette (§4) except brand logos.
5. Mobile-first: everything works from 360 px; **no horizontal page scroll** (last verified at 360/390/768).
6. Respect `prefers-reduced-motion`.
7. Every image has meaningful alt text; outbound links `target="_blank" rel="noopener noreferrer"`.
8. **Never use impeccable's "Live mode / Apply"** feature (it runs an agent with permission checks bypassed) — standing owner decision.
9. `event images/` stays out of git; only optimized copies in `public/seed/` are committed.

## 8. What has been done (history)

1. **Planning** — content from the owner's deck + a reference screenshot (inspiration only); section order agreed; Vite plan switched to Next.js + Supabase + Vercel once the admin panel was added.
2. **Setup** — global skills installed for Claude Code (`design-taste-frontend`, `ui-ux-pro-max`, `impeccable` with hooks); Next.js scaffolded.
3. **Docs** — the 9 files in `docs/`, `CLAUDE.md` with canonical names.
4. **Backend** — migration with RLS, storage bucket, seed data, types, fallback content, Supabase clients, `proxy.ts`, security headers/CSP in `next.config.ts`, seed script.
5. **Photos** — 57 photos categorized and compressed to WebP (8.8 MB) + trimmed logo + venue video.
6. **First build** — all sections + full admin panel (login, gallery upload/reorder/delete, edition, FAQ, content, settings).
7. **Premium round** (21st.dev-inspired) — expanding Experience panels, hanging polaroid line (adapted from 21st.dev "Hanging Polaroid Carousel"), reels coverflow (adapted from 21st.dev "Glassy Coverflow"), gallery polish.
8. **Round 2** — fonts switched to DM Serif Display / Poppins / Anton; nav wordmark; edition rework + venue video; spacing/contrast fixes; venue spelling "MGM Lawns".
9. **Round 3 (coastal kit)** — new hero, decor kit, brand-logo buttons, scroll text reveals everywhere, wavy edition band, new carousel controls, FAQ beside Follow Us, wave footer; fixed blank Instagram logo on phones, 1px horizontal scroll, and the old hero's blank tablet screens.
10. **Handoff docs** (2026-11-18) — `AGENT.md`, `CODEX.md`, pointer in `AGENTS.md`.
11. **Theme decision** (2026-11-18) — owner's next theme is **Kites & Lanterns**; agreed to build a reusable, admin-switchable theme layer instead of redesigning per event. Full plan: `docs/THEME-PLAN.md`. **Not built yet** — owner wants their final-version changes first.
12. **Photo re-curation** (2026-11-20) — owner added ~96 photos; library re-judged, 44 weak/duplicate/unused images removed, 28 new ones in. ~30 new Canon files were stored sideways (camera auto-rotate off) and were rotated by hand. Raw DJI `.DNG` drone files left out (flat/dark).
13. **Hydration warning fix** (2026-11-20) — `suppressHydrationWarning` on `<html>`/`<body>` in `layout.tsx`; the warning came from the owner's Grammarly/Liner browser extensions, not the site.
14. **Owner photos + children's workshops** (2026-11-20) — two photos from chat added (art stall with hand-painted bottles; caricature artist), originals saved in `event images/`; workshops description now mentions children; edition highlights include "Kids' Workshops".

Last verified (2026-11-20): `tsc` clean, `npm run lint` clean, page checked at 1440 / 390 px after the photo changes. Last full `npm run build` + JS weight (≈ 294 KB gzipped) + impeccable scan: 2026-11-17 (impeccable clean except 6 accepted "cyan gradient" warnings — the brand sea colour on the Experience photo scrims).

## 9. Current status and next steps

- ✅ Public site and admin panel built and visually checked at 1440 / 768 / 390 px.
- ⚠️ **Nothing is committed beyond create-next-app's initial commit** (`git status` shows ~27 changed/new paths). Owner said "not yet" to pushing — ask before committing/pushing. Pushing needs `gh auth login` on the machine.
- ⚠️ **Supabase project not created yet** → admin login, uploads and saves are **untested end to end**. Owner steps: create project → run migration then `seed.sql` → Auth: disable sign-ups → create admin user → insert its id into `public.admins` → fill `.env.local` → `npm run seed:images`. Then run `docs/TESTING.md` admin flows.
- ⚠️ **Vercel not connected yet** → import the repo, set the three `NEXT_PUBLIC_*` env vars, set `NEXT_PUBLIC_SITE_URL` to the real domain.
- **Next agreed work:** (1) the owner's "final version" changes — wait for their list; (2) then the Kites & Lanterns theme layer from `docs/THEME-PLAN.md` (ask the owner which activities are real and whether it's the November edition before writing theme copy).
- Images on the site (2026-11-20): hero 5, gallery 32 (flea market 7, food 4, music & dance 5, pets 5, workshops 5, photo moments 5, aerial 1), vendor 8, reels 8 — listed in `src/data/seed-manifest.ts`, files in `public/seed/`. Food is the thinnest category; the owner could send food-prep close-ups and JPEG exports of the drone shots `DJI_0773` / `DJI_0782`.
- Not admin-editable yet (static files): the venue promo video and hero layout composition.
- Small cleanup available: unused create-next-app files `public/{file,globe,next,vercel,window}.svg`.
- Ideas not done: real Instagram reel embeds (cards currently link to the profile); edition history.

## 10. Commands

```bash
cd site
npm install
npm run dev            # http://localhost:3000  (admin: /admin/login)
npm run lint
npx tsc --noEmit
npm run build
npm run seed:images    # only after Supabase is set up and .env.local has the service key
```

Visual checks without a browser pane (Claude Code machine): `node ~/.claude/skills/design-taste-frontend/scripts/shoot.mjs --url http://localhost:3000 --w 1440 --out <dir>/d.png --tiles <dir>/t --profile <temp dir>` with `CHROME_PATH` set to Chrome. No Docker on this machine → no local Supabase.

## 11. Where to read more

| Need | File |
| --- | --- |
| Latest status / log of rounds | `LOG.md` |
| Claude Code instructions (canonical names, skills) | `CLAUDE.md` |
| Codex-specific working guide | `CODEX.md` |
| Product goals | `docs/PRD.md` |
| Exact behaviour per section/admin screen | `docs/FRD.md` |
| Schema, RLS, storage | `docs/DATA-MODEL.md` |
| Tokens, type, components, motion | `docs/UI-UX-GUIDE.md` |
| Security, headers, secrets | `docs/SECURITY.md` |
| Routes/anchors | `docs/SITEMAP.md` |
| Metadata, JSON-LD, keywords | `docs/SEO-STRATEGY.md` |
| QA checklists | `docs/TESTING.md` |
| Setup, Supabase/Vercel steps | `docs/DEVELOPMENT.md` |
| Next planned feature: Kites & Lanterns theme layer | `docs/THEME-PLAN.md` |
