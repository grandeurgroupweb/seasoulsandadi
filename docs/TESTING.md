# Testing

Manual QA plus a few automated checks. Run the full list before every release; run the relevant section after any change to it.

## 1. Automated checks

```bash
npm run lint
npm run build
npx impeccable detect src/
npx impeccable detect http://localhost:3000
npm audit --omit=dev
```

- `build` must finish with no type or lint errors.
- `impeccable detect` against the running dev server catches rendered-page issues (contrast, tiny text) that the source scan cannot.
- Never use impeccable's Live mode / Apply.

## 2. Responsive matrix

Test every public section at each width. No horizontal page scroll anywhere.

| Width | Device class | Browsers |
| --- | --- | --- |
| 360 | Small Android | Android Chrome |
| 390 | iPhone | Safari iOS |
| 768 | Tablet portrait | Safari iOS, Chrome |
| 1024 | Tablet landscape / small laptop | Chrome, Firefox |
| 1280 | Laptop | Chrome, Firefox, Safari |
| 1440 | Desktop | Chrome |

Also check landscape on a phone (hero height, sticky header).

## 3. Public site checklist

### Header / nav
- [ ] Logo shows on first paint (no layout jump).
- [ ] Links scroll to the right anchors (`#experience`, `#edition`, `#gallery`, `#vendors`, `#faq`, `#contact`).
- [ ] Mobile menu opens, traps nothing, closes on link tap and on Escape.
- [ ] No "Book Tickets" button anywhere.

### Hero scroll-zoom
- [ ] Starts on the venue layout image; scrolling zooms into live photos smoothly.
- [ ] Pinning releases cleanly; the next section is not overlapped or hidden.
- [ ] Works on touch scroll (iOS momentum) without jank.
- [ ] With reduced motion on, shows a static hero with no pinning.
- [ ] Hero headline and tagline come from `site_content`.

### The Experience (chips)
- [ ] Six chips: Flea Market, Food Stalls, Live Music & Dance, Pet-Friendly Space, Workshops & Activities, Photo Moments.
- [ ] Clicking a chip shows/scrolls to that category's photos; active state is visible.
- [ ] Descriptions come from `categories.description`.

### This Edition
- [ ] Shows November and "Date Announcing Soon" while `date_announced = false`.
- [ ] Shows the formatted date once the admin sets it and turns `date_announced` on.
- [ ] Venue reads MGM Lawns, Visakhapatnam (or whatever the admin set).
- [ ] CTA points to Instagram, not a ticket page.

### Event Gallery
- [ ] Auto-scrolls continuously; loops with no visible jump.
- [ ] Stops on mouse hover; resumes on leave.
- [ ] Left/right buttons move it manually; work with keyboard.
- [ ] Swipe works on touch.
- [ ] Only published `placement = 'gallery'` images appear, in `sort_order`.

### Become a Vendor
- [ ] Stall photos (`placement = 'vendor'`) render.
- [ ] Button opens `https://wa.me/<number>?text=...` with the message pre-filled.
- [ ] No price or cost mentioned anywhere.

### Reels strip
- [ ] Moves slowly; pauses on hover; manual drag/buttons work.
- [ ] Each card opens its `link_url` (or the Instagram profile) in a new tab.

### FAQ
- [ ] The five FAQs show, in order. One opens at a time (or as specified in `FRD.md`).
- [ ] Opens/closes with Enter and Space; `aria-expanded` updates.

### Footer / Follow us
- [ ] Instagram and Facebook links go to `seasoulsandadi`.
- [ ] Email and phone are correct and clickable (`mailto:`, `tel:`).
- [ ] Tagline reads "Let's build a Sunday culture together."

### Colors
- [ ] Only `#d87459`, `#006994`, `#ecdfc8`, their tints/shades, white and black appear.

## 4. Admin end-to-end flows

Use a test Supabase project or a clearly marked test image, then clean up.

- [ ] **Protected routes**: logged out, visiting `/admin`, `/admin/gallery`, etc. redirects to `/admin/login`.
- [ ] **Login**: wrong password shows an error without saying which field was wrong; correct login lands on the dashboard.
- [ ] **Logout**: signs out and returns to `/admin/login`; back button does not show admin data.
- [ ] **Upload**: pick a large camera JPG. It is resized in the browser, uploads, and appears on the public gallery after refresh. File in the `media` bucket is `.webp`, ≤ 2000 px, random name.
- [ ] **EXIF**: the uploaded file has no GPS/camera metadata.
- [ ] **Edit image**: change alt text, category, placement (gallery/hero/vendor/reel) and published flag; each change reflects on the public site.
- [ ] **Reorder**: new order shows on the public site.
- [ ] **Delete**: row disappears and the Storage object is gone from the bucket.
- [ ] **Edition**: set a date and turn on "date announced"; public card shows the date. Turn it off; "Date Announcing Soon" returns. Change venue.
- [ ] **FAQ**: add, edit, reorder, unpublish, delete. Public FAQ matches.
- [ ] **Content**: edit hero tagline, vendor pitch and footer tagline; public page updates.
- [ ] **Settings**: change WhatsApp number and message; vendor button link changes. Change Instagram URL; links change. Invalid URL or non-digit number is rejected.

## 5. Security checks

- [ ] **Anon cannot write.** This must fail with an RLS error (401/403 or `new row violates row-level security policy`):

  ```bash
  curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/faqs" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"question":"hack","answer":"hack"}'
  ```

  Repeat with `PATCH` on `site_settings` and `DELETE` on `gallery_images`; all must fail.
- [ ] **Anon cannot upload** to the `media` bucket (Storage API `POST /storage/v1/object/media/test.webp` with the anon key fails).
- [ ] **Non-admin authenticated user cannot write.** Create a throwaway user in the dashboard (not in `admins`), sign in, try any admin save: it fails. Delete the user afterwards.
- [ ] **Sign-ups disabled**: `supabase.auth.signUp()` with a new email returns an error.
- [ ] **Service key absent from the bundle**: after `npm run build`, this returns nothing:

  ```bash
  grep -r "service_role" .next/static
  grep -r "$SUPABASE_SERVICE_ROLE_KEY" .next/static
  ```

- [ ] Security headers present (`curl -I https://<site>/`): CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, HSTS.
- [ ] `/admin/*` responses carry `X-Robots-Tag: noindex`.

## 6. Accessibility

- [ ] Keyboard only: Tab through nav → chips → edition CTA → gallery buttons → vendor button → reels → FAQ → footer links, in visual order.
- [ ] Focus is always visible (focus ring uses palette colors).
- [ ] Skip link to main content works.
- [ ] Every image has meaningful alt text; decorative images use `alt=""`.
- [ ] Carousels have accessible names; buttons have labels ("Previous photos", "Next photos").
- [ ] Reduced motion: hero static, gallery and reels stop auto-scrolling.
- [ ] Contrast: body text ≥ 4.5:1, large text ≥ 3:1. Check terracotta on sand and white on terracotta especially.
- [ ] Page has one `h1`, headings in order.
- [ ] Admin forms: every input has a label; errors are announced.

## 7. Performance

Run Lighthouse in mobile mode against a production build (`npm run build && npm start`) and against the Vercel preview.

| Metric | Target |
| --- | --- |
| Performance | ≥ 90 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |
| LCP | < 2.5 s |
| CLS | < 0.1 |

- [ ] Hero image uses `priority`/eager loading; below-fold images lazy-load.
- [ ] All images served via `next/image` with sizes set.
- [ ] Total transferred on first load is reasonable (no raw camera files).

## 8. Release checklist

- [ ] `npm run lint` and `npm run build` pass.
- [ ] `npm audit --omit=dev`: no high/critical.
- [ ] Public checklist (section 3) at 390 and 1280 at minimum.
- [ ] Admin flows (section 4) pass on the Vercel preview.
- [ ] Security checks (section 5) pass against the production Supabase project.
- [ ] Lighthouse targets met on the preview URL.
- [ ] Supabase: sign-ups disabled, leaked-password protection on, RLS enabled on every table.
- [ ] Vercel env vars set for Production and Preview; no service-role key there.
