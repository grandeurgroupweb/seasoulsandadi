# Data model

Supabase Postgres + Storage. Source of truth: `supabase/migrations/20261117000000_init.sql` (schema, RLS, storage) and `supabase/seed.sql` (initial content). TypeScript mirrors live in `src/lib/types.ts`; offline/fallback content in `src/data/fallback.ts`.

## Tables

### `admins`
| column | type | notes |
| --- | --- | --- |
| user_id | uuid PK → `auth.users.id` | cascade delete |
| created_at | timestamptz | |

`public.is_admin()` returns true when `auth.uid()` is in this table. It is `security definer` with `search_path = ''`, so it can read `admins` without RLS recursion. Every write policy calls it.

### `categories`
| column | type | notes |
| --- | --- | --- |
| id | text PK | slug, `^[a-z0-9-]+$`: `flea-market`, `food`, `music-dance`, `pets`, `workshops`, `photo-moments` |
| label | text | "Flea Market" |
| description | text | short line under the chip |
| icon | text | `react-icons/pi` export name, e.g. `PiStorefront` |
| sort_order | int | |
| updated_at | timestamptz | trigger |

Seeded icons: `PiStorefront`, `PiForkKnife`, `PiMusicNotes`, `PiPawPrint`, `PiPaintBrush`, `PiCamera`.

### `gallery_images`
| column | type | notes |
| --- | --- | --- |
| id | uuid PK | |
| storage_path | text unique | path inside bucket `media`, e.g. `gallery/2026/abc.webp` |
| alt | text | required for SEO/a11y; admin fills it in |
| category_id | text → categories | nullable; `on delete set null` |
| placement | text | `gallery` \| `hero` \| `vendor` \| `reel` |
| link_url | text | `https://` only; for reels, the Instagram URL |
| width, height | int | intrinsic size after browser re-encode |
| sort_order | int | |
| is_published | bool | drafts are hidden from the public |
| created_at, updated_at | timestamptz | |

Public URL: `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${storage_path}`.

### `editions` (single row)
`id = 1` enforced by `check (id = 1)`; no delete policy, so the row cannot be removed through the API.

| column | type | notes |
| --- | --- | --- |
| title | text | "November Edition" |
| month_label | text | "November" |
| event_date | date | null until announced |
| date_announced | bool | false → site shows "Date Announcing Soon" |
| venue_name, venue_city | text | "MGM Lawns", "Visakhapatnam" |
| map_url | text | optional `https://` link |
| highlights | text | "Shop · Eat · Music · Workshops · Kids' Workshops · More" |

The admin overwrites this row each month. No history is kept (owner's decision).

### `faqs`
`id uuid, question, answer, sort_order, is_published, updated_at`. Seeded with the 5 approved FAQs using fixed UUIDs so the seed is re-runnable.

### `site_settings` (single row, `id = 1`, no delete)
`whatsapp_number` (digits only, country code included: `919573435222`), `whatsapp_message` (prefilled text), `instagram_url`, `facebook_url`, `email`, `phone_display`.

Vendor CTA: `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(whatsapp_message)}`.

### `site_content`
`key text PK` (`^[a-z0-9_]+$`), `value`, `label` (shown in admin), `section` (groups fields in admin), `sort_order`, `updated_at`.

Keys: `hero_eyebrow`, `hero_title`, `hero_tagline`, `experience_title`, `experience_intro`, `edition_title`, `gallery_title`, `gallery_intro`, `vendor_title`, `vendor_body`, `vendor_cta_label`, `reels_title`, `reels_intro`, `faq_title`, `faq_intro`, `follow_title`, `footer_tagline`, `footer_about`. The `ContentKey` union in `types.ts` must match; the app falls back to `fallback.ts` for any missing key.

## RLS matrix

| table | anon SELECT | authenticated (not admin) | admin INSERT / UPDATE | admin DELETE |
| --- | --- | --- | --- | --- |
| admins | — | own row only | — (SQL editor only) | — |
| categories | all | read all | yes | yes |
| gallery_images | `is_published` | `is_published` | yes (+ reads drafts) | yes |
| editions | all | read all | yes | **no** |
| faqs | `is_published` | `is_published` | yes (+ reads drafts) | yes |
| site_settings | all | read all | yes | **no** |
| site_content | all | read all | yes | yes |

Being signed in is not enough to write: a user who somehow signs up still fails `is_admin()`. Turn off public sign-ups in the dashboard anyway.

## Storage

One bucket, **`media`**, public read. Limit 5 MB per object; MIME types `image/webp`, `image/jpeg`, `image/png`, `image/avif`.

Folders: `gallery/`, `hero/`, `vendor/`, `reels/`, `logo/`. The insert policy rejects any other top-level folder.

| operation | who |
| --- | --- |
| read | anyone |
| insert / update / delete | `is_admin()` only |

Uploads are resized and re-encoded to WebP in the browser (max 2000 px, EXIF dropped), then sent straight to Storage with the admin's session. No large file passes through a Vercel function.

## Single-row pattern

`editions` and `site_settings` use `id integer primary key default 1 check (id = 1)`. Read with `.eq('id', 1).single()`; write with `.update(...).eq('id', 1)` (or `upsert` with `id: 1`). The delete policy is intentionally absent.

## Revalidation after admin writes

The public page is a server component that reads through `src/lib/content.ts`. Each admin Server Action, after a successful write, calls `revalidatePath('/')` so the next visitor gets fresh content. Image uploads: browser uploads the file to Storage, then calls a Server Action that inserts the `gallery_images` row and revalidates. If Supabase is unreachable, `content.ts` serves `fallbackData`.

## Granting the admin

1. Dashboard → Authentication → Users → **Add user** (email + password).
2. Authentication → Sign In / Providers → turn **off** "Allow new users to sign up".
3. SQL editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = '<admin email>';
   ```

To revoke: `delete from public.admins where user_id = '<id>';`

## Applying

- Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`, then run `supabase/seed.sql` in the SQL editor (or `supabase db reset` locally, which applies the seed).
- Without the CLI: paste the migration, then `seed.sql`, into the SQL editor.
