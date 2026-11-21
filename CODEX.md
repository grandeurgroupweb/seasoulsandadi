# CODEX.md — working guide for OpenAI Codex (and other non-Claude agents)

Codex loads `AGENTS.md` automatically; that file points here. This guide is about **how to work** in this repo. For **what the project is and everything done so far**, read `AGENT.md` (full brief) and `LOG.md` (latest status) first.

## Read order before any change

1. `AGENT.md` — project brief, folder map, design system, sections, data flow, rules, history, status.
2. `LOG.md` — what changed most recently and what's pending.
3. The `docs/` file for your task (table in `AGENT.md` §11).
4. `node_modules/next/dist/docs/` for any Next.js API you touch — this is **Next 16**, newer than most training data.

## Hard rules (from the owner — do not break)

- No "Book Tickets" button, ticket prices or stall costs. Vendor CTA = WhatsApp.
- Strict palette: terracotta `#d87459`, sea `#006994`, sand `#ecdfc8` + their tint/shade tokens, white, black. Use tokens (`bg-sea-800`, `text-terracotta-800`…), never raw hex — **except** brand logos inside `components/ui/BrandLogos.tsx`.
- Fonts: `font-serif` (DM Serif Display) for H1/section headings; `font-sans` (Poppins) for everything else; `font-display` (Anton) only for short uppercase labels/numbers.
- Never invent testimonials, numbers or claims.
- Works from 360 px; no horizontal scroll; respect `prefers-reduced-motion`.
- Secrets: never commit `.env.local`, never import `SUPABASE_SERVICE_ROLE_KEY` from `src/`, never paste keys into code or chat.
- Don't commit or push unless the owner asks (they said "not yet" so far).
- The Experience section is owner-approved — don't redesign it unasked.

## Next.js 16 traps in this codebase

- Auth guard is **`src/proxy.ts`** (export `proxy`) — not `middleware.ts`.
- `cacheComponents: true` is on. Public data comes from `getSiteData()` in `src/lib/content.ts` (`'use cache'` + `cacheTag('site')`). Anything reading `cookies()`/session must sit inside `<Suspense>` (see `src/app/admin/(protected)/layout.tsx`). `new Date()` in a prerendered component needs a cached helper (see the footer's year).
- Admin writes must call **`updateTag(SITE_TAG)`** (Server Actions only) so the home page refreshes.
- `next/image`: use `preload` for the LCP image (not `priority`); allowed qualities are `[70, 75, 85]`; Supabase hostname is whitelisted from `NEXT_PUBLIC_SUPABASE_URL` in `next.config.ts`.
- `next dev` rewrites the block between `<!-- BEGIN:nextjs-agent-rules -->` markers in `AGENTS.md`. Edit only outside those markers.

## Use the shared building blocks

| Need | Use |
| --- | --- |
| Section title (animated) | `components/ui/SectionHeading` (`title`, `intro`, `kicker`, `tone="dark"` on sea bands) |
| Other big animated text | `components/ui/RevealText` |
| Fade-up block | `components/site/sections/Reveal` |
| Instagram / Facebook / WhatsApp link | `components/ui/SocialButton` (`platform`, `href`) |
| Any other CTA | `components/ui/Button` → `LinkButton` / `Button` |
| Palms, lighthouse, gulls, waves | `components/decor/*` |
| WhatsApp URL | `whatsappHref(settings)` from `src/lib/content.ts` |
| Images by placement | `imagesFor(data, "gallery" \| "hero" \| "vendor" \| "reel")` |

Reveal components are **visible by default** and only animate content below the fold at load (`useArmedReveal`). Don't change them to start hidden — content must show without JavaScript.

## Verification loop (run before saying a task is done)

```bash
cd site
npx tsc --noEmit
npm run lint
npm run build          # must pass; home page should stay ○ (static) with 1h revalidate
```

Then look at the page at **1440, 768 and 390 px** (any headless browser or Playwright). Check: no horizontal scroll (`document.documentElement.scrollWidth === clientWidth`), headings visible, hero releases into The Experience with no blank band, carousels move and pause, reduced-motion shows static content.

Optional design lint: `npx impeccable detect http://localhost:3000` (the 6 "cyan gradient" warnings on the Experience panel scrims are accepted — that's the brand sea colour).

## Claude-only tools you won't have, and what to do instead

| In `CLAUDE.md` | Codex equivalent |
| --- | --- |
| `ui-ux-pro-max`, `design-taste-frontend`, `impeccable` skills | Follow `docs/UI-UX-GUIDE.md`; run `npx impeccable detect` (CLI works without Claude) |
| `google-fonts` skill | Fonts are already chosen — don't change them |
| `21st` plugin | Not needed; components already adapted |
| `gsap-*` skills | GSAP docs; hero logic lives in `components/site/hero/HeroMotion.tsx` |
| copywriting / `humanizer` skills | Keep copy short, warm and factual; editable copy belongs in `site_content` (types + admin schema + `seed.sql` + `fallback.ts` together) |
| `seo-audit` skill | Follow `docs/SEO-STRATEGY.md` |
| `shoot.mjs` screenshot tool | Playwright or headless Chrome screenshots |

## Adding an editable text field (common task)

Update all five together: `ContentKey` in `src/lib/types.ts`, `CONTENT_KEYS` in `src/lib/admin/schemas.ts`, a row in `supabase/seed.sql`, the value in `src/data/fallback.ts`, and the key list in `docs/FRD.md` + `docs/DATA-MODEL.md`. Then read it as `data.content.<key>`.

## After you finish

Add a dated entry to `LOG.md` (what changed, what was verified, what's pending) so the next agent — Claude or Codex — can continue.
