# Edition themes (seasonal decor layer)

Status: **built 2026-11-20.** First theme: **Sankranti, kites & candle lanterns** (January edition). Owner's rule: a theme must be removable on request without touching the rest of the site, and new themes must slot in the same way.

## Why a theme layer (decision)

Keep the site's structure, content, admin and brand; only the decorative "skin" changes per edition. The owner picks the theme in the admin edition editor and switches back afterwards. A future theme (Diwali, monsoon, Christmas…) is a new folder of illustrations + one registry line, not a redesign.

## How it works

```
src/components/themes/
  index.ts         registry: theme id → { label, slots }; THEME_OPTIONS for the admin dropdown
  ThemeDecor.tsx   <ThemeDecor theme={edition.theme} slot="…">coastal decor</ThemeDecor>
  sankranti/       the whole Sankranti theme (delete this folder to remove it)
    Kite.tsx, Lantern.tsx (SkyLantern, HangingLantern), LanternGarland.tsx, LanternsRising.tsx
    slots.tsx      what each slot shows
    sankranti.module.css   all theme animation, off under reduced motion
    index.ts       the Theme object
```

- **Slots** (`page` is a fixed full-screen layer rendered once in `src/app/page.tsx`, empty in coastal; the rest each replace the gulls in that spot): `hero` (hero sky; keeps `data-hero="birds"` so the scroll zoom flies it away), `edition` (This Edition band), `follow` (Follow Us card), `footer` (footer beach). A theme fills only the slots it wants; any slot it leaves out shows the coastal decor.
- **Data:** `editions.theme text not null default 'coastal'` (migration `20261120000000_edition_theme.sql`). Unknown or missing ids render as coastal, so an old row, a typo or a deleted theme never breaks the page. Locally (no Supabase) the theme comes from `src/data/fallback.ts` (`theme: "sankranti"`).
- **Admin:** `/admin/edition` → "Seasonal decor" dropdown (Coastal + every registered theme). The label is admin-only; nothing about the theme is written on the public site.
- Strict palette: kites and lanterns use terracotta / sea / sand tints only. Pure SVG + CSS, no images, so no effect on page weight.

## Sankranti: what shows

- **Hero:** three kites with fluttering bowed tails drift in the sky (two on phones); candle sky-lanterns float up and fade near the map (tablet/desktop).
- **This Edition:** lantern garland strung across the top of the band (3 dips on phones, 6 above), plus a kite on wide screens.
- **Follow Us card:** short two-lantern garland in the top-right corner.
- **Footer:** kites over the sea, lanterns rising past the lighthouse.
- **Whole page (`page` slot, `PageSky.tsx`):** a fixed layer (z-30, under the header, never takes clicks) with candle sky-lanterns floating up the screen the whole time you scroll (big ones in the side margins, small faint "far away" ones across the middle) and two kites riding across now and then. Hidden entirely under reduced motion. Lantern drawing modelled on the owner's reference photo: paper cylinder, crumpled top, glowing open rim, visible flame.
- Reduced motion: everything rests still. Bonfire left out for now (owner named kites and lanterns); it would be one more file in `sankranti/` and a line in `slots.tsx`.

## Remove a theme

1. Delete `src/components/themes/<id>/`.
2. Delete its import and its line in `THEMES` in `src/components/themes/index.ts`.
3. In `/admin/edition` set "Seasonal decor" to Coastal (or leave it; an unknown id already renders coastal). Locally, set `theme` in `fallback.ts` back to `"coastal"`.

Tested 2026-11-20: with the Sankranti folder and its line removed, `tsc` and lint pass.

## Add a theme

1. Create `src/components/themes/<id>/` with its drawings, a `slots.tsx` and an `index.ts` exporting `{ label, slots: { hero?, edition?, follow?, footer? } }` (each slot a plain render function, no hooks).
2. Add one import + one line to `THEMES` in `src/components/themes/index.ts`.
3. Pick it in `/admin/edition`. No section file changes.

## Verification

- `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Theme = coastal: site identical to before (gulls everywhere).
- Theme = sankranti: check 1440 / 768 / 390, hero zoom still releases into The Experience, no horizontal scroll, reduced motion static.
- Once Supabase exists: run the migration, switch the theme in `/admin/edition`, confirm the public page changes on the next load.
