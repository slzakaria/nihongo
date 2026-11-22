import { SRSCard } from "@/types";

export interface MergeResult {
  merged: Record<string, SRSCard>;
  localOnly: SRSCard[];
}

// Prefer the most recently reviewed card when merging guest progress on sign-in. Pending
// signed-in writes are overlaid separately by the sync flow and always stay local-authoritative.
export function mergeCards(
  serverCards: Record<string, SRSCard>,
  localCards: Record<string, SRSCard>,
): MergeResult {
  const localOnly = Object.values(localCards).filter((card) => {
    const serverCard = serverCards[card.phraseId];
    if (!serverCard) return true;
    if (card.lastReview === null) return false;
    return (
      serverCard.lastReview === null || card.lastReview > serverCard.lastReview
    );
  });
  const merged = { ...serverCards };
  for (const c of localOnly) merged[c.phraseId] = c;
  return { merged, localOnly };
}
