import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { getEnv } from "@/lib/env";

export const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);

export function isStorageConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Normalise any accepted image to a 512×512 transparent PNG. */
export async function normalizeLogo(input: Buffer): Promise<Buffer> {
  return sharp(input, { density: 300 })
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

/**
 * Upload a shop logo to the public Supabase bucket and return its public URL.
 * Throws if storage is not configured or the file is not an accepted image.
 */
export async function uploadLogo(key: string, file: File): Promise<string> {
  const env = getEnv();
  if (!isStorageConfigured()) throw new Error("Logo storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  if (!ACCEPTED.has(file.type)) throw new Error("Upload a PNG, JPG, WebP, GIF or SVG.");
  if (file.size > LOGO_MAX_BYTES) throw new Error("Logo must be under 5 MB.");
  const png = await normalizeLogo(Buffer.from(await file.arrayBuffer()));
  const supabase = createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const path = `${key}/${Date.now()}.png`;
  const { error } = await supabase.storage.from(env.SUPABASE_LOGO_BUCKET).upload(path, png, { contentType: "image/png", upsert: false });
  if (error) throw new Error(`Logo upload failed: ${error.message}`);
  return supabase.storage.from(env.SUPABASE_LOGO_BUCKET).getPublicUrl(path).data.publicUrl;
}
