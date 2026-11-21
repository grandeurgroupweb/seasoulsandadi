# Security

Sea Soul Sandadi is a public, read-only marketing site plus a single-admin content panel. The public site collects no personal data. The only sensitive surface is the admin panel and the Supabase project behind it.

## Threat model

| Asset | Threat | Main control |
| --- | --- | --- |
| Site content (tables, images) | Anyone writing through the public Supabase API with the anon key | RLS: every write policy requires `is_admin()` |
| Admin account | Password guessing, leaked passwords, stolen session | Strong password, leaked-password protection, Supabase rate limits, optional MFA, HttpOnly cookies |
| Service-role key | Key leaks into the browser bundle or git | Used only by `scripts/seed-images.mjs`; never imported from `src/` |
| Storage bucket `media` | Malicious or huge uploads, metadata leaks | Admin-only write policies, bucket MIME/size limits, browser re-encode to WebP |
| Visitors | XSS, clickjacking, tab-nabbing | CSP and security headers, no `dangerouslySetInnerHTML` with DB content, `rel="noopener noreferrer"` |

## 1. Supabase RLS is the real guard

The anon key ships to every browser by design. It is safe **only because** RLS is enabled on every table and on `storage.objects`.

- RLS is **enabled** on `admins`, `categories`, `gallery_images`, `editions`, `faqs`, `site_settings`, `site_content`.
- Public (`anon`, `authenticated`) policies: `select` only, and only published rows where a table has `is_published`.
- Write policies (`insert`, `update`, `delete`) on every content table: `using (is_admin()) with check (is_admin())`.
- `is_admin()` is a `security definer` SQL function with a fixed `search_path` that returns `exists (select 1 from admins where user_id = auth.uid())`.
- `admins` itself has **no** write policy for any client role. The owner adds the admin row once in the SQL editor.
- Hiding admin screens in the UI is convenience only. Every check that matters runs in Postgres.

### Two layers against unwanted accounts

1. **Disable public sign-ups** in Supabase → Authentication → Providers (Email) / Settings: turn off "Allow new users to sign up". This is critical: without it anyone could create an account against the project.
2. Even if someone did get an account, they are `authenticated` but not in `admins`, so `is_admin()` is false and every write is rejected.

Both layers must be on. Do not rely on either alone.

## 2. Admin account

- One admin, email + password, created by the owner in Supabase → Authentication → Users.
- Password: at least 14 characters, unique to this site, kept in a password manager.
- Turn on **leaked password protection** (Authentication → Policies / Password security) and a minimum length.
- MFA (TOTP) is optional but recommended once the site is live.
- Supabase applies built-in rate limits to sign-in and token endpoints. Do not loosen them.
- If the owner forgets the password, reset it from the Supabase dashboard. There is no public "forgot password" page.

## 3. Sessions and server-side auth

- `@supabase/ssr` stores the session in cookies. `src/proxy.ts` (Next 16's renamed middleware; export `proxy`, Node.js runtime) refreshes the session on each request to `/admin/**` and redirects to `/admin/login` when there is no user.
- Server code (Server Components, Server Actions, Route Handlers, `proxy.ts`) must decide with **`supabase.auth.getUser()`** or **`supabase.auth.getClaims()`**, which validate the token. Never trust `getSession()` on the server; it reads the cookie without verifying it.
- `src/app/admin/(protected)/layout.tsx` repeats the check server-side and calls `is_admin()` so a valid but non-admin session never sees admin screens.
- Every Server Action that writes re-checks the user before touching data. Server Actions are public HTTP endpoints, so a missing check is a real hole even though RLS would still block the write.
- Logout calls `supabase.auth.signOut()` and redirects to `/admin/login`.

## 4. Environment variables and secrets

| Variable | Public? | Used by | Lives in |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (in browser bundle) | App | `.env.local`, Vercel env |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (in browser bundle) | App | `.env.local`, Vercel env |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** (bypasses RLS) | `scripts/seed-images.mjs` only | `.env.local` on the owner's machine only. **Not** needed in Vercel. |

Rules:

- `.env*.local` is git-ignored. Only `.env.local.example` (names, no values) is committed.
- Nothing in `src/` reads `SUPABASE_SERVICE_ROLE_KEY`. A grep of the production build for it must return nothing (see `TESTING.md`).
- Keys are never pasted into chat, issues, commits, screenshots or code comments. Put them straight into `.env.local` and the Vercel dashboard.

## 5. Uploads

Flow: admin picks a file → browser resizes and re-encodes it → browser uploads straight to Supabase Storage with the admin's session → a Server Action inserts the `gallery_images` row → `revalidatePath('/')`.

- **Re-encode in the browser**: canvas → WebP, max 2000 px on the long edge. Re-encoding drops EXIF, including GPS location from phone photos.
- Accept only `image/jpeg`, `image/png`, `image/webp` in the file picker and validate again before upload. Reject inputs over 40 MB before processing.
- Bucket `media` settings: public read, **allowed MIME types** `image/webp, image/png, image/jpeg`, **file size limit** 5 MB (post-resize files are well under this).
- Storage policies on `storage.objects` for bucket `media`: `insert`, `update`, `delete` only when `is_admin()`. Public `select` is allowed.
- Object names are random (`gallery/<uuid>.webp`), never the user's file name. This avoids path tricks and leaking original names.
- Deleting an image deletes the Storage object **and** the DB row. No orphans.
- Large files never pass through a Vercel function, so the 4.5 MB request cap is not a factor and there is no server-side image parser to attack.

## 6. Rendering content safely

- Text from `site_content`, `faqs`, `editions`, `gallery_images.alt` is rendered as React text, never with `dangerouslySetInnerHTML`.
- URLs from `site_settings` (Instagram, Facebook) are validated with `zod` as `https://` URLs on save. The WhatsApp number is validated as digits only, and the link is built in code as `https://wa.me/<digits>?text=<encodeURIComponent(message)>`.
- Every outbound link uses `target="_blank" rel="noopener noreferrer"`.
- `gallery_images.link_url` (reels) must be an `https://` URL on an allow-listed host (`instagram.com`, `www.instagram.com`, `facebook.com`, `www.facebook.com`).

## 7. Security headers

The public page is statically rendered and revalidated, so this project uses the **no-nonce CSP** from `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` ("Without Nonces"), set in `next.config.ts`. Fonts come from `next/font/google`, which self-hosts them at build time, so no Google Fonts domain is needed. Instagram, Facebook and WhatsApp are only link targets, so they need no CSP entry.

```ts
// next.config.ts
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data:${supabaseHost ? ` https://${supabaseHost}` : ""}`,
  "font-src 'self'",
  `connect-src 'self'${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
```

Notes:

- `'unsafe-inline'` for scripts is the documented trade-off for a static page without nonces. Moving to nonces would force dynamic rendering of `/`, which costs performance. Revisit only if the site ever renders untrusted HTML.
- HSTS is served by Vercel on its domains anyway. Keep the header for custom domains; add `preload` only once the domain is confirmed HTTPS-only for good.
- Admin routes also send `X-Robots-Tag: noindex` and are disallowed in `robots.txt`.

## 8. Public site privacy

- No forms, no analytics cookies, no tracking pixels, no newsletter capture. The vendor CTA hands off to WhatsApp; nothing is stored by us.
- If analytics are added later (for example Vercel Analytics, which is cookieless), update this file and the CSP.

## 9. Dependencies

- `package-lock.json` is committed; install with `npm ci` in CI.
- Run `npm audit --omit=dev` before each release; fix high and critical issues.
- Enable **Dependabot** (security updates and version updates, weekly, npm) on the GitHub repo.
- Add packages only when needed. Prefer well-maintained ones.

## 10. Incident response

If a key or the admin password may have leaked:

1. **Service-role key or anon key**: Supabase → Project Settings → API → rotate the JWT secret / regenerate keys. This invalidates the old keys and all sessions.
2. Update `.env.local` and the Vercel env vars with the new values, then **redeploy** on Vercel.
3. **Admin password**: reset it in Supabase → Authentication → Users and sign out all sessions.
4. Check `gallery_images`, `site_content`, `faqs`, `site_settings` and the `media` bucket for unexpected changes; restore from Supabase backups if needed.
5. If a secret was committed to git, rotating it is the fix. Removing it from history is secondary.
