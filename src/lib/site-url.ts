// NEXT_PUBLIC_SITE_URL wins (set it to the custom domain once connected); on Vercel the
// production URL is the fallback so canonicals never point at localhost.
const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelProduction ? `https://${vercelProduction}` : "http://localhost:3000")
).replace(/\/$/, "");
