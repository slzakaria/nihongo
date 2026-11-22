import { createClient } from '@/lib/supabase/client';

interface BookmarkRow {
  phrase_id: string;
}

export async function fetchBookmarks(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('phrase_bookmarks')
    .select('phrase_id')
    .eq('user_id', userId);
  if (error) throw error;
  return ((data ?? []) as BookmarkRow[]).map((row) => row.phrase_id);
}

export async function upsertBookmarks(userId: string, phraseIds: string[]) {
  if (phraseIds.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.from('phrase_bookmarks').upsert(
    phraseIds.map((phraseId) => ({ user_id: userId, phrase_id: phraseId })),
    { onConflict: 'user_id,phrase_id' },
  );
  if (error) throw error;
}

export async function deleteBookmarks(userId: string, phraseIds: string[]) {
  if (phraseIds.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase
    .from('phrase_bookmarks')
    .delete()
    .eq('user_id', userId)
    .in('phrase_id', phraseIds);
  if (error) throw error;
}
