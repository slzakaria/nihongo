import { createClient } from '@/lib/supabase/client';
import { SRSCard } from '@/types';

interface CardRow {
  phrase_id: string;
  scenario_slug: string;
  interval: number;
  repetitions: number;
  ease_factor: number;
  next_review: string;
  last_review: string | null;
}

function toCard(row: CardRow): SRSCard {
  return {
    phraseId: row.phrase_id,
    scenarioSlug: row.scenario_slug,
    interval: row.interval,
    repetitions: row.repetitions,
    easeFactor: row.ease_factor,
    nextReview: new Date(row.next_review).getTime(),
    lastReview: row.last_review ? new Date(row.last_review).getTime() : null,
  };
}

function toRow(userId: string, card: SRSCard) {
  return {
    user_id: userId,
    phrase_id: card.phraseId,
    scenario_slug: card.scenarioSlug,
    interval: card.interval,
    repetitions: card.repetitions,
    ease_factor: card.easeFactor,
    next_review: new Date(card.nextReview).toISOString(),
    last_review: card.lastReview ? new Date(card.lastReview).toISOString() : null,
  };
}

export async function fetchServerCards(userId: string): Promise<Record<string, SRSCard>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('srs_cards')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  const cards: Record<string, SRSCard> = {};
  for (const row of (data ?? []) as CardRow[]) cards[row.phrase_id] = toCard(row);
  return cards;
}

export async function upsertCards(userId: string, cards: SRSCard[]) {
  if (cards.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.from('srs_cards').upsert(
    cards.map((c) => toRow(userId, c)),
    { onConflict: 'user_id,phrase_id' },
  );
  if (error) throw error;
}

export async function deleteScenarioCards(userId: string, scenarioSlugs: string[]) {
  if (scenarioSlugs.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase
    .from('srs_cards')
    .delete()
    .eq('user_id', userId)
    .in('scenario_slug', scenarioSlugs);
  if (error) throw error;
}
