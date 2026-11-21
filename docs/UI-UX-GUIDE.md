# UI/UX Guide — Sea Soul Sandadi

The look: warm, calm, coastal, handmade. A Sunday by the sea, not a loud flea market. Sand is the paper, sea is the ink, terracotta is the hand-painted sign. Tokens are defined once in `src/app/globals.css` (`@theme`); components use the Tailwind classes they generate and never hard-code hex values.

Light theme only. There is no dark mode: the brand lives on sand. Deep sea sections (`.on-dark`) give contrast inside the page instead.

## 1. Color

Strict palette: terracotta `#d87459`, sea `#006994`, sand `#ecdfc8`, plus white, black and the shades below. No other hue anywhere, including the admin panel, error states, focus rings and charts. The default Tailwind palette is switched off (`--color-*: initial`), so `bg-blue-500` and friends do not exist.

| Token | Hex | Class example | Use |
| --- | --- | --- | --- |
| `terracotta-500` (`terracotta`) | #d87459 | `bg-terracotta-500` | Primary CTA fill, active chip, highlights |
| `terracotta-300` | #e6a694 | `text-terracotta-300` | Accent text on deep sea sections |
| `terracotta-600` | #b8634c | `text-terracotta-600` | Meaningful icons on sand (3.24:1) |
| `terracotta-700` | #98523f | `text-terracotta-700` | Serif headings on sand (large text only) |
| `terracotta-800` | #794132 | `text-terracotta-800` | Small terracotta text on sand, errors (`danger`) |
| `sea-600` (`sea`) | #006994 | `bg-sea-600` | Secondary buttons, links, brand blue |
| `sea-800` | #004561 | `.on-dark` | Deep sections: edition band, follow band, footer |
| `sea-900` (`ink`) | #003347 | `text-ink` | Body text, headings |
| `sea-950` (`ink-deep`) | #00212e | `text-ink-deep` | Text on terracotta fills |
| `sea-700` (`ink-muted`, `ring`) | #00577a | `text-ink-muted` | Secondary text, captions, focus ring |
| `sand-200` (`sand`, `surface`) | #ecdfc8 | `bg-surface` | Page background |
| `sand-100` (`surface-raised`) | #f3ebdd | `bg-surface-raised` | Alternating sections, chips at rest |
| `sand-50` (`surface-card`) | #fdfcfb | `bg-surface-card` | Cards, admin panels, inputs |
| `sand-300` (`line`) | #d4c8b4 | `border-line` | Hairlines, input borders, dividers |

Each hue also has a full 50–950 scale (`terracotta-*`, `sea-*`, `sand-*`) for hover states and tints.

### Contrast rules (WCAG 2.2, checked)

| Foreground on background | Ratio | Allowed for |
| --- | --- | --- |
| ink `#003347` on sand `#ecdfc8` | 10.20 | All text |
| ink-muted `#00577a` on sand | 6.03 | All text |
| sea-600 `#006994` on sand | 4.63 | All text, links |
| white on sea-600 | 6.09 | All text (secondary buttons) |
| sand-200 on sea-800 | 7.88 | All text in `.on-dark` sections |
| terracotta-300 on sea-800 | 5.06 | Accent text in `.on-dark` |
| terracotta-800 on sand | 6.10 | Small terracotta text, error messages |
| ink-deep on terracotta-500 | 5.22 | **Primary button labels** |
| terracotta-700 on sand | 4.42 | **Large text only** (≥ 24 px, e.g. serif headings) |
| terracotta-600 on sand | 3.24 | Icons and UI shapes only, not text |
| white on terracotta-500 | 3.20 | **Not allowed** for button labels or small text |
| terracotta-500 on sand | 2.43 | **Not allowed** for text or meaningful icons; decoration only |

Rule of thumb: terracotta fills get dark ink text, never white. Terracotta as text on light backgrounds is `-700` for big headings and `-800` for anything small.

## 2. Typography

Owner's choice (2026-11-17), replacing the earlier Kaushan Script + Figtree pairing:

- **DM Serif Display** (`font-serif`) — the H1, section headings (`SectionHeading`), the nav wordmark, and italic accents (footer tagline, polaroid notes). Use `tracking-tight` at large sizes. Not for body text, buttons or the admin panel.
- **Poppins** (`font-sans`, the default; weights 400/500/600/700) — everything else: body, UI, buttons, cards, admin.
- **Anton** (`font-display`) — the owner's "Impact" look, as Google's near-identical font. Only short uppercase labels and numbers: counters ("03 / 08"), the date badge, small kickers. Never sentences.

| Token | Size (360 → 1280 px) | Line height | Use |
| --- | --- | --- | --- |
| `text-hero` | 48 → 112 px | 0.95 | Hero H1 (DM Serif) |
| `text-section` | 36 → 64 px | 1.05 | Section headings (DM Serif) |
| `text-4xl` | 32 → 52 px | 1.1 | Big sans statements, edition month |
| `text-3xl` | 26 → 36 px | 1.2 | Sub-headings, admin page titles |
| `text-2xl` | 22 → 28 px | 1.3 | Card titles, FAQ questions on desktop |
| `text-xl` | 19 → 22 px | 1.45 | Lead paragraphs |
| `text-lg` | 18 px | 1.6 | Intro copy |
| `text-base` | 16 px | 1.65 | Body |
| `text-sm` | 14 px | 1.5 | Captions, chip labels, admin table cells |
| `text-xs` | 13 px | 1.45 | Fine print, footer legal (never smaller) |

Weights: 400 body, 500 UI labels, 600 buttons and card titles, 700–800 eyebrows and big statements. Eyebrows: `text-sm font-bold uppercase tracking-[0.14em] text-ink-muted`. Body measure: `max-w-prose` (42rem).

## 3. Layout and spacing

Breakpoints, mobile-first: base 0 (design at 360), `xs` 360, `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Every section must work at 360 px with no horizontal scroll (`body` has `overflow-x: clip`).

- Container: `.container-site` = `max-w-site` (78rem) + fluid gutter (`px-gutter`, 16 → 40 px).
- Section rhythm: `.section-y` (`py-section`, 64 → 120 px). One idea per section. Alternate `bg-surface` and `bg-surface-raised`; use `.on-dark` (sea-800) for at most three bands: This Edition, Follow Us, Footer.
- Section head pattern: kicker (Anton, optional) → DM Serif heading → one-line intro (`text-lg text-ink-muted`), centered on mobile, left-aligned from `lg` when paired with media.
- Sticky header height `--spacing-header` (4.5rem); `scroll-padding-top` already accounts for it, so anchor links land below the header.
- Radius: `rounded-sm` 6, `rounded-md` 12 (inputs, small cards), `rounded-lg` 20 (photo cards), `rounded-xl` 28 (feature panels), `rounded-pill` (chips, buttons).
- Shadows are sea-tinted, never grey: `shadow-soft` (chips, inputs on focus), `shadow-card` (photo and edition cards), `shadow-lift` (hover state, open menu).

## 4. Components

**Header.** Sticky, `bg-surface/90` with `backdrop-blur-md` once scrolled (transparent over the hero before that), bottom hairline `border-line` after scroll. Logo left (40 px tall mobile, 52 px desktop). Desktop nav: Figtree 500, `text-sm`/`text-base`, `text-ink`, active section underlined with a 2 px terracotta-500 bar. No Book Tickets button. Mobile (< `lg`): 44 × 44 menu button opening a full-height sheet from the right (`bg-surface-card`, links at `text-2xl`, Instagram/Facebook icons at the bottom), focus trapped, `Esc` closes, body scroll locked.

**Category chip** (The Experience). Pill or rounded-lg tile with icon (24 px, `text-terracotta-600`) above or beside a label (`text-sm font-semibold`). Rest: `bg-surface-card shadow-soft text-ink`. Hover: `shadow-lift`, lift 2 px. Active/selected: `bg-terracotta-500 text-ink-deep` with the icon in `text-ink-deep`. Min touch target 44 px. On mobile the six chips form a 3 × 2 grid; from `md` a single row of six.

**Photo card.** `rounded-lg overflow-hidden shadow-card`, image `object-cover`, a 6 px `sand-50` inner frame (`p-1.5 bg-surface-card`) for the handmade "printed photo" feel. Optional caption chip bottom-left: `bg-surface-card/90 text-xs font-semibold text-ink rounded-pill px-3 py-1`. Hover (pointer devices only): image scales to 1.04 over 520 ms `ease-out-soft`.

**Edition card** (This Edition, `.on-dark` band). Two columns from `lg`: photo (4:3, slightly rotated -1.5° with the photo-card frame) and details. Details: script heading, month in `text-4xl font-extrabold text-sand-50`, date line — when the date is not announced, a pill badge "Date Announcing Soon" (`bg-terracotta-500 text-ink-deep text-sm font-bold`) — venue with a map-pin icon in `text-terracotta-300`, highlights line ("Shop · Eat · Music · Workshops · More") in `text-sand-200`, and a "Follow for updates" primary button linking to Instagram.

**Carousel controls.** Round 48 px buttons, `bg-surface-card text-ink shadow-soft`, icon 22 px, hover `bg-terracotta-500 text-ink-deep`. Always visible (also on touch devices, where swipe works too), placed at the vertical middle on `md+` and below the track on mobile. `aria-label` "Previous photos" / "Next photos". Edge fade on the track via a mask (`mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent)`).

**Reel card.** Portrait 9:16, `rounded-lg`, photo thumbnail with a soft bottom scrim (sea-950 at 0 → 70% opacity), centered play glyph in a 56 px circle (`bg-surface-card/90 text-ink`), caption in `text-sm font-semibold text-white` at the bottom (white on the scrim, which keeps it above 4.5:1), Instagram icon top-right. Whole card is one link (`target="_blank" rel="noopener noreferrer"`). Widths: 170 px mobile, 220 px desktop.

**Accordion** (FAQ). Each item a `bg-surface-card rounded-md shadow-soft` row; question button full width, `text-lg font-semibold text-ink`, number prefix in `text-terracotta-700`, a plus icon that rotates 45° when open. Answer `text-base text-ink-muted`, height animated with `motion` (see Motion). One open at a time is fine but not required; `aria-expanded` and `aria-controls` mandatory.

**Buttons.** All `rounded-pill`, `h-12 px-6` (mobile full-width when they are the section's main action), Poppins 600, icon 18–20 px with a 2 px nudge on hover.
- Primary: `bg-terracotta-500 text-ink-deep`, hover `bg-terracotta-400`, active `bg-terracotta-600`. Used for Apply as a Vendor (WhatsApp), Follow for updates.
- Secondary: `bg-sea-600 text-white`, hover `bg-sea-700`. On `.on-dark`: `bg-sand-100 text-ink`.
- Ghost: `border-2 border-sea-600 text-sea-700 bg-transparent`, hover `bg-sea-50`. On `.on-dark`: `border-sand-200 text-sand-100`, hover `bg-sea-700`.
- Disabled: 50% opacity, `cursor-not-allowed`.

**Footer.** `.on-dark` with `bg-sea-900`. Logo, tagline "Let's build a Sunday culture together." in DM Serif italic at `text-3xl text-sand-50`, quick links, contact (email, phone), Instagram/Facebook icon buttons (44 px), copyright `text-xs text-sand-300`.

### Admin UI

Same tokens, quieter. Poppins only in the admin (no serif or Anton).

- **Shell.** Desktop: 248 px left sidebar `bg-sea-900 text-sand-100`, logo on top, nav items `text-sm font-medium` with the active item `bg-sea-700` and a 3 px terracotta-500 left bar; content area `bg-surface-raised`. Mobile (< `lg`): top bar with the page title and a menu button opening the same nav as a sheet. Sign-out at the bottom of the nav.
- **Page header.** `text-3xl font-bold text-ink`, one-line help text in `text-ink-muted`, primary action button on the right.
- **Data table.** `bg-surface-card rounded-lg shadow-soft`, header row `text-xs uppercase tracking-wide text-ink-muted bg-sand-100`, rows `text-sm` with `border-line` dividers, 64 px thumbnails `rounded-sm`. Row actions as icon buttons with labels for screen readers. Below `md` rows become stacked cards.
- **Form fields.** Label above (`text-sm font-semibold text-ink`), input `h-11 rounded-md bg-surface-card border border-line px-3 text-base`, focus `border-sea-600 shadow-soft` plus the global ring. Help text `text-xs text-ink-muted`. Error: `border-terracotta-800`, message `text-sm text-terracotta-800` with an alert icon (never color alone). Textareas auto-grow; character counters for alt text.
- **Upload dropzone.** Dashed 2 px `border-sea-300` `rounded-lg bg-sea-50`, icon + "Drop photos or browse" + "JPG, PNG or WebP, up to 25 MB; we resize them for the web". Drag-over: `border-terracotta-500 bg-terracotta-50`. Each file shows a progress row (thumbnail, name, bar in `bg-sea-600`, status).
- **Toast.** Bottom-right (bottom-center on mobile), `bg-sea-900 text-sand-50 rounded-md shadow-lift`, success icon `text-terracotta-300`, error variant `bg-terracotta-800 text-white` (8.03:1), auto-dismiss after 4 s, `role="status"` (errors `role="alert"`).

## 5. Motion

Calm and slow, like the tide. Durations: `--duration-fast` 160 ms (hover), `--duration-base` 260 ms (UI state), `--duration-slow` 520 ms (image hover, menu), `--duration-reveal` 700 ms (in-view reveals). Easing: `ease-out-soft` for entrances, `ease-in-out-soft` for state changes, `ease-spring` only for the chip press.

- **GSAP + ScrollTrigger: the hero only.** Pinned section about 250–300 vh tall on desktop, 200 vh on mobile, `scrub: 0.6`. Sequence: layout map (night render) at scale 1 → scale ~2.2 toward the stalls → crossfade to the aerial drone photo → crossfade into a mosaic of 4–6 live photos (shopping, food, music/dance, pets, workshop), each fading/rising in with a 0.08 stagger → headline and CTAs settle. Animate only `transform` and `opacity`. Use `useGSAP` from `@gsap/react` with a scoped ref so it cleans up; register ScrollTrigger once. Call `ScrollTrigger.refresh()` after hero images load.
- **`motion` (`motion/react`) for everything else:** section reveals with `whileInView` (opacity 0 → 1, y 24 → 0, 700 ms, `once: true`, `amount: 0.2`), FAQ answer height (`AnimatePresence` + `height: "auto"`, 260 ms), chip press (scale 0.97), mobile menu sheet (x 100% → 0, 320 ms).
- **Embla AutoScroll speeds:** gallery `speed: 0.8`, reels `speed: 0.45` (visibly slower, as requested). Both `stopOnMouseEnter: true`, `stopOnInteraction: false`, `stopOnFocusIn: true`, `loop: true`, `dragFree: true`. Manual arrows call `scrollPrev/scrollNext` and autoplay resumes after mouse leave. Reels run in the opposite direction (`direction: "backward"`).
- **Reduced motion** (`prefers-reduced-motion: reduce`): no pinning or scroll-zoom; the hero renders as a static layered composition (map image with the photo mosaic below it). AutoScroll plugins are not started; carousels become plain swipeable rows with the arrow buttons. Reveals render immediately. The global CSS rule in `globals.css` already zeroes CSS transitions.

## 6. Images

- Hero: full-bleed, `object-cover`; layout renders 16:9 (desktop) / cropped 4:5 on mobile with `object-position` set toward the stalls. `priority` only on the first hero image.
- Gallery: mixed 4:5 and 3:2 tiles at fixed height (240 px mobile, 320 px desktop) so the strip stays even; `object-cover`.
- Category/vendor photos: 4:3, `rounded-lg`, photo-card frame.
- Reels: 9:16.
- Always `next/image` with `sizes`, served from Supabase Storage (WebP, max 2000 px). Alt text from `gallery_images.alt`; decorative layers get `alt=""`.
- Treatment: no filters or color overlays except the sea-950 scrim on reel cards. Slight rotation (±1.5°) is reserved for the edition photo and vendor collage, never the gallery.

## 7. Icons

`react-icons`, one family for UI: **Lucide** (`react-icons/lu`) — stroke icons at 1.75–2 px. Brand icons (Instagram, Facebook, WhatsApp) from **Simple Icons** (`react-icons/si`). Sizes: 18 px inline, 22 px controls, 24–28 px category chips. Icons inherit `currentColor`; meaningful icons on sand use `text-terracotta-600` or darker, never `-500`. Every icon-only button has an `aria-label`.

Category icons (suggested): Flea Market `LuStore`, Food Stalls `LuUtensils`, Live Music & Dance `LuMusic`, Pet-Friendly Space `LuPawPrint`, Workshops & Activities `LuPalette`, Photo Moments `LuCamera`.

## 8. Don'ts

- No colors outside the palette, including in gradients, shadows (sea-tinted only), focus rings and admin states.
- No purple, neon, glassmorphism, or generic "AI startup" styling; no gradient text.
- No white text on terracotta-500, no terracotta-500 text on sand.
- No DM Serif below 24 px; no Anton for sentences; Poppins only in the admin.
- No emoji as icons or decoration.
- No fake testimonials, ratings, attendee counts or "as seen in" logos.
- No Book Tickets button, prices or stall fees.
- No autoplaying audio or video; no motion that ignores reduced-motion.
