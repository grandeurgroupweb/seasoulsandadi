@AGENTS.md

# Sea Soul Sandadi — agent instructions

Landing page + admin panel for **Sea Soul Sandadi**, a once-a-month Sunday gathering by the sea in Visakhapatnam (Vizag): curated local brands, slow food, live acoustic music and dance, workshops, families and pets. Content source: `../Sea_Soul_Sandadi_Presentation_With_Image_Placeholders.md`. Photo library: `../event images/` (raw camera files, 10–40 MB each; never edit in place).

**Start with `LOG.md`**: current status, what's half-done, and the next steps. `AGENT.md` is the full self-contained project brief (shared with non-Claude agents); `CODEX.md` is the guide for Codex. Keep all three in sync when something important changes.

Detailed specs live in `docs/`. Read the one that matches your task before writing code:

| Task | Read |
| --- | --- |
| What we are building and why | `docs/PRD.md` |
| Exact behavior of a section or admin screen | `docs/FRD.md` |
| Tables, columns, RLS, storage | `docs/DATA-MODEL.md` |
| Colors, type, spacing, motion, components | `docs/UI-UX-GUIDE.md` |
| Secrets, auth, uploads, headers | `docs/SECURITY.md` |
| Routes and anchors | `docs/SITEMAP.md` |
| Metadata, schema.org, alt text | `docs/SEO-STRATEGY.md` |
| QA checklists | `docs/TESTING.md` |
| Setup, scripts, env vars, conventions | `docs/DEVELOPMENT.md` |
| Next planned feature (edition themes, Kites & Lanterns) | `docs/THEME-PLAN.md` |

## Stack (settled, do not re-litigate)

- **Next.js 16 (App Router) + TypeScript**, `src/` dir, Turbopack. This is not the Next.js in your training data: read `node_modules/next/dist/docs/` before using an API. Known changes: `middleware.ts` is now **`proxy.ts`** (export `proxy`); `params`, `searchParams`, `cookies()`, `headers()` are **async**; `revalidateTag(tag, profile)` needs two args (use `updateTag`/`revalidatePath` in Server Actions); `next/image` default `qualities` is `[75]`.
- **React 19**, **Tailwind CSS v4** (CSS-first config: tokens live in `@theme` inside `src/app/globals.css`; there is no `tailwind.config.ts`).
- **Supabase**: Postgres + Storage + Auth via `@supabase/ssr` and `@supabase/supabase-js`.
- **Animation**: `gsap` + `@gsap/react` (`useGSAP`) with ScrollTrigger for the hero scroll-zoom only. **`motion`** (`import { motion } from "motion/react"`, the renamed Framer Motion) for light in-view transitions, the FAQ accordion and chip states.
- **Carousels**: `embla-carousel-react` + `embla-carousel-auto-scroll` (gallery and reels).
- **Icons**: `react-icons`. **Validation**: `zod`.
- **Hosting**: Vercel. **Repo**: `github.com/grandeurgroupweb/seasoulsandadi` (public). This `site/` folder is the repo root.

## Color palette (strict)

Only these three hues, plus white/black for text contrast and tints/shades of the three:

- `--color-terracotta: #d87459` — primary accent: CTAs, highlights, active states
- `--color-sea: #006994` — secondary: headings, dark sections, nav/footer
- `--color-sand: #ecdfc8` — base background, light sections

No other hue anywhere: not in icons, badges, gradients, focus rings, admin UI or charts. Every component pulls colors from the `@theme` tokens, never hard-coded hex values.

**One owner-approved exception:** third-party brand logos keep their official colours (Instagram gradient, Facebook blue, WhatsApp green). They live only in `components/ui/BrandLogos.tsx` and are used through `SocialButton`; the button itself stays in the palette.

## Shared building blocks (use these, don't re-invent)

- `components/ui/SectionHeading` — every section title; animates in word by word (`RevealText`), optional Anton `kicker`.
- `components/ui/RevealText` — masked word-by-word reveal for any other big text (visible by default; animates only content below the fold at load).
- `components/site/sections/Reveal` — fade-up wrapper for blocks.
- `components/ui/SocialButton` + `BrandLogos` — every Instagram/Facebook/WhatsApp link.
- `components/ui/Button` (`LinkButton`) — all other CTAs.
- `components/decor/` — `Palm`, `Lighthouse`, `Birds`, `Waves`: the coastal illustration kit (pure SVG, colour via `text-*` classes, animations in `globals.css` `decor-*`, stopped by reduced motion).

## Content rules

- No "Book Tickets" button anywhere, no ticket prices, no vendor stall cost. Tickets and announcements go through Instagram/Facebook (`seasoulsandadi`).
- Vendor / Volunteer / Sponsor buttons open a form (`components/site/apply/ApplyDialog`); "Send" opens WhatsApp `https://wa.me/<whatsapp_number>?text=<the filled form>`. WhatsApp number and contact phone are both `+91 95734 35222` (`919573435222`). No WhatsApp logo on these three buttons.
- Current edition: **January** (Sankranti theme), date **"Announcing Soon"** until the admin sets one; venue MGM Lawns, Beach Road (next to the Light House), Visakhapatnam.
- Never invent testimonials, numbers, quotes, awards or claims. Copy comes from the source `.md`, the FAQ text in `docs/FRD.md`, and facts the user gave.
- Footer tagline: "Let's build a Sunday culture together."
- Contact: `seasoulsandadi@gmail.com`, `+91 95734 35222`, Instagram/Facebook `seasoulsandadi`.

## Architecture (canonical names — use exactly these)

Public site: `src/app/page.tsx` (server component) reads all content through `src/lib/content.ts`, which queries Supabase with the anon key and falls back to `src/data/fallback.ts` when Supabase env vars are missing or a query fails. Section components live in `src/components/site/`.

Admin: `src/app/admin/` — `login`, `gallery`, `edition`, `faq`, `content`, `settings`. Auth-gated by `src/proxy.ts` (session refresh + redirect to `/admin/login`) **and** by a server-side check in `src/app/admin/(protected)/layout.tsx`. RLS is the real guard; UI gating is convenience only.

Supabase tables (full spec in `docs/DATA-MODEL.md`):
- `admins (user_id uuid pk → auth.users)` + SQL function `is_admin()` — every write policy checks it.
- `categories (id text pk slug, label, description, icon, sort_order)` — slugs: `flea-market`, `food`, `music-dance`, `pets`, `workshops`, `photo-moments`.
- `gallery_images (id uuid, storage_path, alt, category_id → categories, placement in ('gallery','hero','vendor','reel'), link_url, width, height, sort_order, is_published, created_at)`.
- `editions` — single row `id = 1`: `title, month_label, event_date (nullable), date_announced bool, venue_name, venue_city, map_url, highlights, updated_at`.
- `faqs (id uuid, question, answer, sort_order, is_published)`.
- `site_settings` — single row `id = 1`: `whatsapp_number, whatsapp_message, instagram_url, facebook_url, email, phone_display`.
- `site_content (key text pk, value, label, section, sort_order, updated_at)` — editable page copy.
- Storage: one public-read bucket **`media`**, folders `gallery/`, `hero/`, `vendor/`, `reels/`, `logo/`. Writes only when `is_admin()`.

Uploads: images are resized and re-encoded **in the browser** (canvas → WebP, max 2000 px, strips EXIF) and uploaded **directly to Supabase Storage** with the admin's session, so nothing large passes through a Vercel function (4.5 MB request cap). A Server Action then inserts the DB row and calls `revalidatePath('/')`.

Secrets: only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by the app at runtime. `SUPABASE_SERVICE_ROLE_KEY` is used **only** by the local seed script in `scripts/` and is never imported from `src/`. Real keys go in `.env.local` (git-ignored) and Vercel's dashboard; never in code, commits or chat.

## Skills to use

| When | Skill |
| --- | --- |
| Design decisions, palette/type/layout, GSAP presets | `ui-ux-pro-max`, `design-taste-frontend`, `impeccable` |
| Fonts | `google-fonts` |
| Real component patterns | `21st` plugin (`21st-ui`) when installed |
| Spacing/motion rules, React structure | `web-design-guidelines`, `web-animation-design`, `vercel-react-best-practices` (audit-suite plugin) |
| Scroll animation | `gsap-scroll-trigger`, `gsap-react`, `gsap-performance` |
| On-page copy | `landing-page-copy`, `copy-edit`, `brand-voice`, then `humanizer` |
| SEO pass | `seo-audit` |
| Final polish/critique | `impeccable` (`critique`, `audit`, `polish`) |

Never use impeccable's Live mode / Apply feature (it launches an agent with permission checks bypassed). This is a standing decision by the project owner.

## Conventions

- Mobile-first; every section must work from 360 px wide up. No horizontal page scroll.
- Respect `prefers-reduced-motion`: disable the scroll-zoom and auto-scroll, show static content.
- Server components by default; `"use client"` only for interactive pieces (carousels, accordion, hero animation, admin forms).
- Every image needs meaningful `alt` text (stored per image in `gallery_images.alt`).
- Outbound links: `target="_blank" rel="noopener noreferrer"`.
- Comments only where the why is non-obvious.
