/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * Uploads a file directly to Supabase Storage bucket.
 * Falls back to local Object URL if Supabase keys are not configured.
 */
export async function uploadFileToSupabase(
  file: File,
  bucketName: string = 'vkid-media',
  folderPath: string = 'uploads',
  onProgress?: (percent: number) => void
): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'bin';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `${folderPath}/${fileName}`;

  if (supabase) {
    if (onProgress) onProgress(30);

    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (onProgress) onProgress(80);

    if (error) {
      console.warn('Supabase storage upload error, falling back to local object URL:', error.message);
      const objectUrl = URL.createObjectURL(file);
      if (onProgress) onProgress(100);
      return objectUrl;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    if (onProgress) onProgress(100);
    return publicUrlData.publicUrl;
  } else {
    // Simulated upload progress for local files when Supabase env vars are not set
    if (onProgress) {
      onProgress(25);
      await new Promise((r) => setTimeout(r, 150));
      onProgress(65);
      await new Promise((r) => setTimeout(r, 150));
      onProgress(100);
    }
    return URL.createObjectURL(file);
  }
}
