import { createClient } from '@/lib/supabase/client';
import type { SRSGrade } from '@/types';

export interface SRSReviewEventWrite {
  id: string;
  phraseId: string;
  scenarioSlug: string;
  rating: SRSGrade;
  reviewedAt: number;
}

export async function upsertSRSReviewEvents(
  userId: string,
  events: SRSReviewEventWrite[],
): Promise<void> {
  if (events.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.from('srs_review_events').upsert(
    events.map((event) => ({
      id: event.id,
      user_id: userId,
      phrase_id: event.phraseId,
      scenario_slug: event.scenarioSlug,
      rating: event.rating,
      reviewed_at: new Date(event.reviewedAt).toISOString(),
    })),
    { onConflict: 'id' },
  );
  if (error) throw error;
}
