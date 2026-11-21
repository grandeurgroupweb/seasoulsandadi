// One-time upload of public/seed/** into Supabase Storage + gallery_images rows.
// Run locally with `npm run seed:images` after the migration and seed.sql are applied.
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local; never run this on Vercel.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  console.error("Missing .env.local — copy .env.local.example and fill it in.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}

// Node 22.18+ strips TypeScript types natively, so the manifest is imported as-is.
const { seedImages } = await import(pathToFileURL(path.join(root, "src/data/seed-manifest.ts")).href);

const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const folderFor = { gallery: "gallery", hero: "hero", vendor: "vendor", reel: "reels" };

const { data: settings } = await sb.from("site_settings").select("instagram_url").eq("id", 1).maybeSingle();
const instagram = settings?.instagram_url ?? "https://www.instagram.com/seasoulsandadi";

const { data: existing, error: listError } = await sb.from("gallery_images").select("storage_path");
if (listError) {
  console.error("Could not read gallery_images. Did you run the migration?", listError.message);
  process.exit(1);
}
const already = new Set(existing.map((row) => row.storage_path));

async function upload(storagePath, localFile) {
  const body = await readFile(localFile);
  const { error } = await sb.storage
    .from("media")
    .upload(storagePath, body, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`${storagePath}: ${error.message}`);
}

let added = 0;
for (const img of seedImages) {
  const rel = img.file.replace(/^\/?(seed\/)?/, "");
  const storagePath = `${folderFor[img.placement]}/${path.basename(rel)}`;
  if (already.has(storagePath)) continue;

  await upload(storagePath, path.join(root, "public", "seed", rel));
  const { error } = await sb.from("gallery_images").insert({
    storage_path: storagePath,
    alt: img.alt,
    category_id: img.category_id,
    placement: img.placement,
    link_url: img.placement === "reel" ? instagram : null,
    width: img.width,
    height: img.height,
    sort_order: img.sort_order,
    is_published: true,
  });
  if (error) throw new Error(`insert ${storagePath}: ${error.message}`);
  added += 1;
  console.log(`+ ${storagePath}`);
}

await upload("logo/logo.webp", path.join(root, "public", "logo.webp"));

console.log(`Done. ${added} new image(s), ${seedImages.length - added} already present. Logo uploaded.`);
