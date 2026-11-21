# Functional Requirements — Sea Soul Sandadi

Canonical names (tables, routes, slugs) follow `CLAUDE.md` and `docs/DATA-MODEL.md`. Public sections live in `src/components/site/`; content loads through `src/lib/content.ts`, which falls back to `src/data/fallback.ts` when Supabase is missing or a query fails.

## Shared rules

- **Data loading:** `src/app/page.tsx` is a server component. All content loads on the server, so there are no client-side loading spinners on the public site. If a Supabase query fails, that section renders fallback content. It never renders an error message or an empty broken block.
- **Published only:** public queries return rows with `is_published = true` only, ordered by `sort_order` ascending, then `created_at`.
- **Reduced motion:** when `prefers-reduced-motion: reduce` is set, the hero renders as a static layout plus a photo grid, carousels do not auto-scroll (manual buttons still work), and no parallax or zoom runs.
- **Breakpoints:** mobile below 768 px, tablet from 768 to 1023 px, desktop from 1024 px. The page has no horizontal scroll at any width from 360 px.
- **Outbound links:** open in a new tab with `rel="noopener noreferrer"`.
- **Images:** served with `next/image` from the `media` bucket, each with its `alt` from `gallery_images.alt`.
- **Copy:** text marked as a `site_content` key comes from `site_content.value`. If a key is missing, the fallback value from `src/data/fallback.ts` is used.

Category slugs: `flea-market`, `food`, `music-dance`, `pets`, `workshops`, `photo-moments`.
Placements: `gallery`, `hero`, `vendor`, `reel`.

---

## Public site (page order)

### 1. Header / nav — `Header.tsx`

**Purpose:** branding and fast navigation to sections.
**Data:** logo from `media/logo/` (static fallback in `public/`). No `site_content` keys.

**Behavior**

- Shows the logo on the left. On desktop, anchor links: Home (`#top`), Experience (`#experience`), This Edition (`#edition`), Gallery (`#gallery`), Vendors (`#vendors`), FAQ (`#faq`), Contact (`#contact`).
- Sticky. It is transparent over the hero and gets a solid sand background with a shadow after the user scrolls past the hero.
- On mobile, a hamburger button opens a full-height menu. The menu closes on link tap, on `Esc` or on the close button, and focus is trapped while it is open.
- Anchor links smooth-scroll, offset by the header height. Smooth scrolling is turned off under reduced motion.
- The active section is highlighted in the nav, based on scroll position.
- No "Book Tickets" button.

**Acceptance criteria**

1. Every nav link scrolls to its section with the heading visible below the sticky header.
2. The mobile menu is operable by keyboard alone, and `aria-expanded` reflects its state.
3. The header never covers content at any breakpoint.
4. No ticket or booking link exists in the header.

### 2. Hero scroll-zoom — `HeroScrollZoom.tsx`

**Purpose:** show the whole venue, then zoom into real moments.
**Data:**
- `gallery_images` where `placement = 'hero'`. The first image is the night venue layout render; the rest are moment photos tagged with categories (shopping/`flea-market`, `food`, `music-dance`, `pets`, `workshops`, `photo-moments`).
- `site_content` keys: `hero_eyebrow`, `hero_title`, `hero_tagline`.
- Follow link from `site_settings.instagram_url`.

**Behavior**

- The section is pinned while the user scrolls through a scroll distance of about 3–4 viewport heights (GSAP ScrollTrigger, `scrub`).
- **Stage 0:** the night venue layout render fills the viewport, with the eyebrow, title, tagline, a "Follow on Instagram" link and a scroll cue on top.
- **Stage 1:** the layout scales up (zooms toward the stalls) and the text fades out.
- **Stages 2–7:** real photos crossfade in one after another (shopping, food, music/dance, pets, workshops, photo moments). Each photo shows a short category label.
- **End:** the pin releases and the page continues normally into The Experience.
- Mobile uses the same sequence with a shorter scroll distance (about 2.5 viewport heights) and `object-fit: cover` crops.
- **Reduced motion:** no pin. The layout image shows with the text, followed by a 2×3 (mobile) or 3×2 (desktop) grid of the moment photos.
- **Missing images:** if no hero images are configured, a static layout from the fallback renders. If only the layout image exists, it shows without the zoom sequence.

**Acceptance criteria**

1. The first paint shows the layout render with readable text: contrast at least 4.5:1 via a sea-tinted overlay.
2. Scrolling forward and backward scrubs the sequence smoothly, without jumps, at 60 fps on a mid-range phone.
3. After the sequence ends, normal scrolling resumes. There is no stuck pin and no blank gap.
4. The reduced-motion version shows all the same images and text.
5. The hero image loads with priority; the other hero images lazy-load ahead of their stage.

### 3. The Experience — `ExperienceChips.tsx` (+ per-category showcase)

**Purpose:** show everything a visitor experiences in one place.
**Data:**
- `categories` (`label`, `description`, `icon`, `sort_order`).
- `gallery_images` where `placement = 'gallery'` grouped by `category_id`, up to 6 per category.
- `site_content` keys: `experience_title`, `experience_intro`.

**Behavior**

- A row of six chips (icon and label): Flea Market, Food Stalls, Live Music & Dance, Pet-Friendly Space, Workshops & Activities, Photo Moments.
- Selecting a chip shows that category's showcase below it: the description and up to 6 photos. On mobile the showcase is a swipeable strip; on desktop it is an asymmetric grid. The change animates with `motion` (fade/slide, about 250 ms).
- The first chip is selected by default.
- Chips behave as a tablist (`role="tablist"`, arrow-key navigation, `aria-selected`).
- On mobile, the chips wrap into a 3×2 grid, or a horizontally scrollable row with no page overflow.
- A category with no photos shows its description only, with no empty grid.

**Acceptance criteria**

1. All six categories render, in `sort_order`.
2. Keyboard users can move between chips with the arrow keys and activate one with Enter or Space.
3. Switching categories never changes the page scroll position unexpectedly.

### 4. This Edition — `ThisEdition.tsx` (`#edition`)

**Purpose:** say when and where the next edition is.
**Data:**
- `editions` row `id = 1` (`title`, `month_label`, `event_date`, `date_announced`, `venue_name`, `venue_city`, `map_url`, `highlights`).
- `site_content` key: `edition_title`.
- `site_settings.instagram_url`.

**Behavior**

- A card with the title (default "November Edition"), date, venue, highlights line (for example "Shop · Eat · Music · Workshops · More") and CTA.
- If `date_announced = false` or `event_date` is null, the card shows a **"Date Announcing Soon"** badge instead of a date.
- If `date_announced = true`, it shows the formatted date, for example "Sunday, 16 November 2026", in `en-IN` format.
- The venue shows as "`venue_name`, `venue_city`". If `map_url` is set, the venue links to it (new tab).
- The CTA is **"Follow for updates"** and links to Instagram. There is no ticket button.
- The card stacks vertically on mobile; on desktop, date and venue sit side by side.

**Acceptance criteria**

1. Toggling `date_announced` in the admin switches the badge or date on the public page after save, with no deploy.
2. No ticket or price text appears.
3. The default seeded state is November, "Date Announcing Soon", MGM Lawns, Visakhapatnam.

### 5. Event Gallery — `GalleryCarousel.tsx` (`#gallery`)

**Purpose:** highlights from past editions.
**Data:**
- `gallery_images` where `placement = 'gallery'` (all categories), with `alt`, `width` and `height`.
- `site_content` keys: `gallery_title`, `gallery_intro`.

**Behavior**

- Embla carousel with `loop: true` and `embla-carousel-auto-scroll`, at a slow speed (about 0.6–0.8 px per frame).
- Auto-scroll **pauses** on mouse hover, on keyboard focus inside the carousel and on touch/drag. It resumes after the pointer leaves or focus moves out, and resumes after about 3 s of inactivity following touch.
- **Prev/next buttons** are always visible at every breakpoint. They are real `<button>`s with `aria-label`s, and each moves by one slide.
- Swipe/drag works on touch devices. Slides are about 80% of the viewport wide on mobile, 3 visible on tablet and 4–5 visible on desktop.
- Images keep their aspect ratio inside fixed-height tiles (`object-fit: cover`).
- The gallery loops infinitely with no visible jump.
- **Reduced motion:** no auto-scroll; the buttons and swipe still work.
- With 0 images, the section is hidden. With 1–3 images, it shows a static row with no loop.

**Acceptance criteria**

1. Hovering stops the movement within one frame, and leaving resumes it.
2. Prev/next are reachable with Tab and work with Enter or Space.
3. There is no layout shift as images load, because `width` and `height` are set.
4. An image published in the admin appears here after save.

### 6. Become a Vendor — `VendorCTA.tsx` (`#vendors`)

**Purpose:** invite local brands to sell, via WhatsApp.
**Data:**
- `gallery_images` where `placement = 'vendor'` (2–4 stall photos).
- `site_content` keys: `vendor_title`, `vendor_body`, `vendor_cta_label`.
- `site_settings.whatsapp_number` and `site_settings.whatsapp_message`.

**Behavior**

- Heading and body copy, a CTA button, and a collage of stall photos.
- The CTA links to `https://wa.me/<whatsapp_number>?text=<encodeURIComponent(whatsapp_message)>`, opening in a new tab.
- Defaults: number `919573435222`; message along the lines of "Hi Sea Soul Sandadi, I'd like to know about setting up a stall at the next edition."
- The number is stored with digits only (country code included, no `+` or spaces). The link is built on the server.
- No pricing or cost information.
- Photos and copy stack on mobile; on desktop they sit in two columns.

**Acceptance criteria**

1. Tapping the CTA on a phone opens WhatsApp with the prefilled message to the configured number.
2. Changing the number or message in Settings updates the link after save.
3. The section contains no price or fee text.

### 7. Reels strip — `ReelsMarquee.tsx`

**Purpose:** a social proof teaser that sends people to Instagram (it replaces testimonials).
**Data:**
- `gallery_images` where `placement = 'reel'`: the thumbnail is the image, and `link_url` is the reel URL, falling back to `site_settings.instagram_url`.
- `site_content` keys: `reels_title`, `reels_intro`.

**Behavior**

- Vertical 9:16 cards with a play-icon overlay and an optional caption from `alt`.
- **Very slow continuous marquee:** Embla loop plus auto-scroll at about 0.3–0.4 px per frame.
- Pauses on hover and focus. The strip is manually draggable and swipeable, and auto-scroll resumes afterwards.
- Each card is a link to `link_url`, opening in a new tab. Its accessible name is something like "Watch reel on Instagram: <alt>".
- **Reduced motion:** static, horizontally scrollable strip.
- With 0 reel images, the section shows one "Watch us on Instagram" card linking to the profile.

**Acceptance criteria**

1. Movement is clearly slower than the gallery.
2. Dragging works with mouse and touch.
3. Every card opens Instagram in a new tab.

### 8. FAQ — `FAQAccordion.tsx` (`#faq`)

**Purpose:** answer common questions.
**Data:**
- `faqs` (`question`, `answer`, `sort_order`, `is_published`).
- `site_content` key: `faq_title`.

**Behavior**

- Single-open accordion: opening one item closes the others. All items start closed.
- Each header is a `<button>` with `aria-expanded` and `aria-controls`. The panel uses `role="region"`.
- Height animates with `motion` (about 200–250 ms). Under reduced motion, panels open and close instantly.
- The plus icon rotates to a cross when open.
- With 0 published FAQs, the section is hidden.

**Seed content (verbatim)**

1. **What is Sea Soul Sandadi?** Sea Soul Sandadi is a once-a-month Sunday gathering by the sea, bringing together food, music, makers, pets, and conversations in a calm, curated space.
2. **Is it a flea market?** It's more than a flea market. It's a Sunday community experience featuring thoughtful brands, slow food, live acoustic music, and families in a beautiful setting.
3. **When is it happening?** Stay connected with us on Instagram and Facebook for announcements about upcoming editions, event dates, and exciting updates.
4. **Why are you doing this?** Vizag deserves a Sunday space where people don't rush. A place to sit, listen, eat, connect, and just be.
5. **What kind of crowd is this for?** It's for people who enjoy good food, live music, local brands, and relaxed Sunday vibes. Families, friends, and even pets are welcome!

**Acceptance criteria**

1. Only one answer is open at a time.
2. The accordion is fully keyboard operable, and screen readers announce the expanded or collapsed state.
3. The FAQ output also feeds the `FAQPage` JSON-LD (see `SEO-STRATEGY.md`).

### 9. Follow Us / Footer — `Footer.tsx` (`#contact`)

**Purpose:** follow for dates and tickets, plus contact details.
**Data:**
- `site_settings` (`instagram_url`, `facebook_url`, `email`, `phone_display`, `whatsapp_number`).
- `site_content` keys: `follow_title`, `footer_tagline`, `footer_about`.

**Behavior**

- **Follow band:** title (for example "Follow Us for Updates"), plus "Follow on Instagram" and "Follow on Facebook" buttons. A note that dates and ticket announcements are posted there.
- **Footer:** logo, `footer_about`, quick links (the same anchors as the nav), Instagram and Facebook icons, email (`mailto:`), phone (`tel:`), tagline "Let's build a Sunday culture together.", and "© <current year> Sea Soul Sandadi".
- Columns stack on mobile; on desktop there are 3–4 columns.

**Acceptance criteria**

1. All social, mailto and tel links resolve correctly.
2. The tagline renders exactly as stored. The default is "Let's build a Sunday culture together."
3. The copyright year is current.

---

## Admin panel (`/admin`)

**Shared admin rules**

- Every route except `/admin/login` requires a signed-in user who is in `admins`. `src/proxy.ts` refreshes the session and redirects to `/admin/login?next=<path>`, and `src/app/admin/(protected)/layout.tsx` re-checks on the server.
- The layout is a sidebar with Gallery, Edition, FAQ, Content, Settings, plus "View site" (new tab) and "Sign out". On mobile, the sidebar becomes a top drawer.
- Every save gives feedback: a success toast ("Saved"), or an error toast with a readable message. Buttons disable and show "Saving…" while a save is pending.
- Every successful mutation calls `revalidatePath('/')`, so the public site updates within seconds.
- Forms are validated with `zod`, on the client and again in the Server Action.
- Admin pages are `noindex`.

### A1. Login — `/admin/login`

- Email and password form (Supabase Auth `signInWithPassword`). No sign-up link and no magic link.
- Wrong credentials show "Email or password is incorrect." The message does not say which one was wrong.
- A valid user who is not in `admins` is signed out and shown "This account does not have admin access."
- On success, the user is redirected to `next` (only relative `/admin/...` paths are accepted) or to `/admin/gallery`.
- An already-signed-in admin who visits `/admin/login` is redirected to `/admin/gallery`.

**Acceptance criteria**

1. Logged-out access to any `/admin/*` page redirects to login.
2. Open-redirect values in `next` (absolute URLs) are ignored.
3. Sign out clears the session and returns to login.

### A2. Gallery manager — `/admin/gallery`

**Data:** `gallery_images`, `categories`, Storage bucket `media`.

**Behavior**

- **Upload:** pick or drop multiple files (JPEG, PNG or WebP; up to 40 MB each, as raw camera files are large).
  - Each file is resized in the browser to a maximum of 2000 px on the long edge and re-encoded to WebP at about 0.8 quality, which strips EXIF.
  - The file is uploaded directly to `media/<placement>/<uuid>.webp` with the admin session.
  - A Server Action then inserts the row (`storage_path`, `alt`, `category_id`, `placement`, `link_url`, `width`, `height`, `is_published`, `sort_order` appended at the end).
  - Each file shows its own progress and result. Files that fail type or size validation are rejected with a reason.
- **Per-image fields:** alt text (**required**, 5–200 characters), category (one of 6 slugs, or none), placement (`gallery` / `hero` / `vendor` / `reel`), link URL (shown for `reel`; must be `https://`), and a published toggle.
- **List:** a grid of thumbnails, filterable by placement and category. Each tile has edit, publish toggle and delete.
- **Reorder:** move up/down buttons (keyboard-accessible) within a placement, which persist `sort_order`. Drag-to-reorder is optional on top of the buttons.
- **Delete:** a confirm dialog ("Delete this photo? This can't be undone."). It removes the Storage object **and** the row. If the Storage delete fails, the row is kept and an error shows.
- **Empty state:** "No photos yet. Upload your first one."

**Acceptance criteria**

1. A 20 MB camera JPEG uploads successfully and is stored as a WebP under 2000 px.
2. Saving without alt text is blocked with an inline error.
3. Unpublished images disappear from the public site after save, and republished ones return.
4. A deleted image is gone from both the bucket and the table.
5. A new `hero` / `vendor` / `reel` image appears in its public section.

### A3. Edition editor — `/admin/edition`

**Data:** `editions` row `id = 1` (single record, overwritten monthly; no history).

**Behavior**

- Fields: title, month label, "Date announced?" toggle, event date (date picker, enabled only when the toggle is on and required then), venue name, venue city, map URL (optional, `https://`), highlights.
- A live preview of the public card sits beside the form on desktop and below it on mobile.
- Save updates row `id = 1` with an upsert. There is no create or delete.

**Acceptance criteria**

1. With the toggle off, the public card shows "Date Announcing Soon" even if a date is filled in.
2. With the toggle on and no date, the save is blocked.
3. The change is visible on `/` after save.

### A4. FAQ editor — `/admin/faq`

**Data:** `faqs`.

**Behavior**

- A list of questions in order, each with edit, publish toggle, move up/down and delete (with a confirm).
- Add/edit form: question (required, up to 200 characters) and answer (required, up to 1000 characters, plain text with line breaks preserved).
- Seeded with the 5 verbatim FAQs above.

**Acceptance criteria**

1. Reordering changes the public order.
2. Unpublishing hides the question publicly.
3. Deleting asks for confirmation first.

### A5. Content editor — `/admin/content`

**Data:** `site_content` (`key`, `value`, `label`, `section`, `sort_order`).

**Behavior**

- Fields are grouped by `section`: Hero, Experience, Edition, Gallery, Vendor, Reels, FAQ, Follow, Footer.
- Each field shows its human `label` and a textarea, with a character counter.
- Editable keys: `hero_eyebrow`, `hero_title`, `hero_tagline`, `experience_title`, `experience_intro`, `edition_title`, `gallery_title`, `gallery_intro`, `vendor_title`, `vendor_body`, `vendor_cta_label`, `reels_title`, `reels_intro`, `faq_title`, `faq_intro`, `follow_title`, `footer_tagline`, `footer_about`.
- Keys are fixed. The admin edits values only and cannot add or delete keys.
- There is one "Save section" button per group.
- An empty value is not allowed for titles and CTA labels. Intros and body text may be empty, in which case they are hidden publicly.
- Category descriptions (for The Experience) are edited here as well, through the `categories.description` fields, shown in an "Experience categories" group.

**Acceptance criteria**

1. Editing `footer_tagline` changes the footer text after save.
2. Required keys cannot be saved blank.
3. Category descriptions update the Experience showcase.

### A6. Settings — `/admin/settings`

**Data:** `site_settings` row `id = 1`.

**Behavior**

- Fields: WhatsApp number (digits only, 10–15 digits, country code included; the input strips `+` and spaces), WhatsApp message (up to 300 characters), Instagram URL and Facebook URL (must be `https://`), email (valid email), phone display (free text such as "+91 95734 35222").
- A "Test WhatsApp link" button opens the generated `wa.me` link in a new tab.

**Acceptance criteria**

1. An invalid number or URL is blocked with an inline error.
2. After save, the vendor CTA, follow buttons and footer links use the new values.
