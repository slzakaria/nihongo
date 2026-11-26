import { createClient } from '@/lib/supabase/client';
import type { FlashcardProgressResetState } from '@/store/progress';

interface FlashcardProgressResetRow {
  reset_version: number | string;
  reset_at: string;
}

export async function fetchFlashcardProgressResetState(): Promise<FlashcardProgressResetState> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('flashcard_progress_state')
    .select('reset_version, reset_at')
    .eq('id', 1)
    .single();
  if (error) throw error;

  const row = data as FlashcardProgressResetRow;
  const version = Number(row.reset_version);
  const resetAt = Date.parse(row.reset_at);
  if (!Number.isSafeInteger(version) || version < 0 || !Number.isFinite(resetAt)) {
    throw new Error('Supabase returned an invalid flashcard reset state.');
  }
  return { version, resetAt };
}
