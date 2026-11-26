import { createClient } from '@/lib/supabase/client';
import type { ScenarioPhraseProgress } from '@/store/progress';

interface ScenarioPhraseProgressRow {
  phrase_id: string;
  scenario_slug: string;
  explored_at: string;
}

function toProgress(row: ScenarioPhraseProgressRow): ScenarioPhraseProgress {
  return {
    scenarioSlug: row.scenario_slug,
    exploredAt: new Date(row.explored_at).getTime(),
  };
}

export async function fetchServerScenarioProgress(
  userId: string,
): Promise<Record<string, ScenarioPhraseProgress>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('scenario_phrase_progress')
    .select('phrase_id, scenario_slug, explored_at')
    .eq('user_id', userId);
  if (error) throw error;

  const progress: Record<string, ScenarioPhraseProgress> = {};
  for (const row of (data ?? []) as ScenarioPhraseProgressRow[]) {
    progress[row.phrase_id] = toProgress(row);
  }
  return progress;
}

export async function upsertScenarioProgress(
  userId: string,
  progress: Array<{ phraseId: string; value: ScenarioPhraseProgress }>,
) {
  if (progress.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.from('scenario_phrase_progress').upsert(
    progress.map(({ phraseId, value }) => ({
      user_id: userId,
      phrase_id: phraseId,
      scenario_slug: value.scenarioSlug,
      explored_at: new Date(value.exploredAt).toISOString(),
    })),
    { onConflict: 'user_id,phrase_id' },
  );
  if (error) throw error;
}
