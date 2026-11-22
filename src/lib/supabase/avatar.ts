import { createClient } from '@/lib/supabase/client';
import { upsertProfile } from '@/lib/supabase/profile';

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const EXTENSIONS: Record<(typeof AVATAR_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Uploads to the public `avatars` bucket under the user's own folder, then saves the URL on the profile
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!AVATAR_TYPES.includes(file.type as (typeof AVATAR_TYPES)[number])) {
    throw new Error('Please choose a JPG, PNG or WebP image.');
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error('Images must be 2 MB or smaller.');
  }

  const supabase = createClient();
  const ext = EXTENSIONS[file.type as (typeof AVATAR_TYPES)[number]];
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600',
  });
  if (error) throw new Error(error.message);

  // The timestamp busts the browser cache, since the file keeps the same path after a new upload
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`;
  await upsertProfile(userId, { avatar_url: url });
  return url;
}
