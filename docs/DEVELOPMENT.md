# Development

How to run, set up and change the Sea Soul Sandadi site. For what each piece does, see `FRD.md`; for the schema, `DATA-MODEL.md`.

## Prerequisites

- Node.js 22 or newer, npm
- A Supabase project (free tier is enough)
- A Vercel account connected to GitHub (for deploys)

## Local setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # http://localhost:3000
```

Without Supabase values in `.env.local` the public site still runs: `src/lib/content.ts` falls back to `src/data/fallback.ts` and the images in `public/seed/`. The admin panel needs Supabase.

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key, only for the seed script>
```

Never commit `.env.local`. See `SECURITY.md` for which keys are secret.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build (type-check + lint) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run seed:images` | `node scripts/seed-images.mjs`: uploads everything in `public/seed/**` to the `media` bucket and inserts matching `gallery_images` rows, using `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`. Run once after the migrations; safe to re-run (skips existing paths). |

## Supabase setup (owner, one time)

1. Create a project at supabase.com. Pick a region close to India (for example Mumbai, `ap-south-1`).
2. Open **SQL Editor** and run each file in `supabase/migrations/` in name order, then `supabase/seed.sql`.
   Or, with the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`, and run `seed.sql` in the SQL editor.
3. **Authentication → Sign In / Providers**: keep Email enabled and **turn off "Allow new users to sign up"**.
4. **Authentication → Policies / Password security**: set minimum length, turn on leaked password protection.
5. **Authentication → Users → Add user**: create the admin with your email and a strong password (auto-confirm).
6. Copy that user's UUID and run in the SQL editor:

   ```sql
   insert into admins (user_id) values ('<the-user-uuid>');
   ```

7. **Project Settings → API**: copy the Project URL and the anon key into `.env.local` (and later Vercel). Copy the service-role key into `.env.local` only.
8. Confirm **Storage** has the `media` bucket (created by the migration) marked public.
9. Run `npm run seed:images` to load the starter photos.

## Vercel setup

1. Vercel → Add New → Project → import `grandeurgroupweb/seasoulsandadi`.
2. Framework preset: **Next.js**. Root directory: repository root (this `site/` folder is the repo root). Build command and output: defaults.
3. Environment variables (Production and Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Do **not** add the service-role key.
4. Deploy. `next.config.ts` already reads the Supabase hostname from `NEXT_PUBLIC_SUPABASE_URL` for `images.remotePatterns` and the CSP, so no extra image config is needed.
5. Optional: add the custom domain under Project → Domains.

Every push to `main` deploys to production; every other branch or PR gets a preview URL.

## Folder structure

```
site/
├── CLAUDE.md, AGENTS.md          agent instructions
├── docs/                         PRD, FRD, DATA-MODEL, UI-UX-GUIDE, SECURITY, SITEMAP, SEO-STRATEGY, TESTING, DEVELOPMENT
├── next.config.ts                images.remotePatterns, security headers
├── .env.local.example            variable names only
├── public/
│   ├── seed/                     optimized starter photos (fallback + seed source)
│   └── favicon, logo fallback
├── scripts/
│   └── seed-images.mjs           one-off uploader (service-role key)
├── supabase/
│   ├── migrations/*.sql          tables, RLS, is_admin(), storage bucket + policies
│   └── seed.sql                  categories, edition, FAQs, settings, site_content rows
└── src/
    ├── proxy.ts                  session refresh + /admin redirect (Next 16 "middleware")
    ├── app/
    │   ├── layout.tsx, page.tsx  public landing page
    │   ├── globals.css           Tailwind v4 + @theme tokens
    │   ├── robots.ts, sitemap.ts
    │   └── admin/
    │       ├── login/page.tsx
    │       └── (protected)/      layout.tsx (auth + is_admin check), gallery, edition, faq, content, settings
    ├── components/
    │   ├── site/                 Header, HeroScrollZoom, ExperienceChips, ThisEdition, GalleryCarousel,
    │   │                         VendorCTA, ReelsMarquee, FAQAccordion, Footer
    │   └── admin/                upload form, tables, editors
    ├── lib/
    │   ├── supabase/client.ts    browser client
    │   ├── supabase/server.ts    server client (cookies)
    │   ├── content.ts            all public reads + fallback
    │   └── types.ts              DB types
    └── data/fallback.ts          static content used when Supabase is unavailable
```

## Conventions

- Public sections: `src/components/site/`. Server components by default; `"use client"` only for the hero animation, carousels, accordion and mobile menu.
- Admin screens: `src/app/admin/(protected)/<screen>/page.tsx`, with their forms in `src/components/admin/` and writes in Server Actions next to the page (`actions.ts`).
- All public data goes through `src/lib/content.ts`. Do not query Supabase from section components.
- Colors only from the `@theme` tokens in `globals.css` (`terracotta`, `sea`, `sand`). See `UI-UX-GUIDE.md`.
- Next.js 16 differs from older versions: read `node_modules/next/dist/docs/` before using an API (`proxy.ts`, async `cookies()`/`params`, two-arg `revalidateTag`).

### Adding an editable text (`site_content` key)

1. Add a row in a new migration or in `seed.sql`: `insert into site_content (key, value, label, section, sort_order) values ('vendor_note', '...', 'Vendor note', 'vendor', 40);`
2. Add the same key and default value to `src/data/fallback.ts`.
3. Read it in the section via the content object from `src/lib/content.ts`.
4. The Content admin screen lists rows by `section` automatically, so no admin code change is needed.

### How content updates reach the public page

`/` is statically rendered and cached. Every admin Server Action that writes calls `revalidatePath('/')`, so the next visitor gets fresh content. Nothing needs a redeploy.

## Common owner tasks (admin panel, no code)

Log in at `/admin/login`.

- **Change the edition date**: Edition → pick the date → turn on "Date announced" → Save. Turn it off to show "Date Announcing Soon".
- **Change the venue**: Edition → venue name / city → Save.
- **Add photos**: Gallery → Upload → choose files → set category, placement (gallery, hero, vendor, reel) and alt text → Save. Large camera photos are fine; they are shrunk in the browser.
- **Hide or remove a photo**: Gallery → toggle Published, or Delete (removes the file too).
- **Edit FAQs**: FAQ → edit, add, drag to reorder, or delete.
- **Edit page text**: Content → change the hero tagline, vendor pitch, footer tagline, etc.
- **Change the WhatsApp number or social links**: Settings → update → Save. Use the number with country code, digits only (for example `919573435222`).
