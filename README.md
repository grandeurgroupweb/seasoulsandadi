# Sea Soul Sandadi

Website and admin panel for **Sea Soul Sandadi**, a once-a-month Sunday gathering by the sea in Visakhapatnam: local makers, slow food, live music, families and pets.

- **Public site** (`/`): scroll-zoom hero over the venue layout, the experience by category, this month's edition, an auto-scrolling gallery, vendor enquiries via WhatsApp, Instagram reels, FAQ.
- **Admin panel** (`/admin`): one owner login to manage photos, the edition date and venue, FAQs, page text and contact links.

Built with Next.js 16, React 19, Tailwind CSS 4, Supabase (database, storage, auth), GSAP and Embla. Hosted on Vercel.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase URL and anon key
npm run dev
```

Without Supabase keys the site still runs on the built-in content in `src/data/fallback.ts`.

Full setup (Supabase project, admin account, Vercel) is in [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md). Other docs: [PRD](docs/PRD.md), [FRD](docs/FRD.md), [data model](docs/DATA-MODEL.md), [UI/UX guide](docs/UI-UX-GUIDE.md), [security](docs/SECURITY.md), [SEO](docs/SEO-STRATEGY.md), [sitemap](docs/SITEMAP.md), [testing](docs/TESTING.md).
