export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const MEDIA_BUCKET = "media";

export function publicMediaUrl(storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}
