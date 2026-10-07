import { SRSCard } from '@/types'

export interface MergeResult {
  merged: Record<string, SRSCard>
  localOnly: SRSCard[]
}

// Server is authoritative for any card it already has; local-only cards (e.g. guest
// progress made before first sign-in, or edited on another device) are added on top.
export function mergeCards(
  serverCards: Record<string, SRSCard>,
  localCards: Record<string, SRSCard>
): MergeResult {
  const localOnly = Object.values(localCards).filter(c => !serverCards[c.phraseId])
  const merged = { ...serverCards }
  for (const c of localOnly) merged[c.phraseId] = c
  return { merged, localOnly }
}
