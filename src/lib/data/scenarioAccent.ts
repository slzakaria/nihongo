// A fixed-looking but stable "random" pick per scenario (hashed from its slug), so each scenario's
// name always shows the same brand colour wherever its card appears, instead of changing with its
// position in whichever grid it happens to be rendered in. Used by ScenarioCard, ScenarioMiniCard
// and the flashcards picker list.
const ACCENTS = ['text-primary', 'text-secondary', 'text-accent'] as const
// Same hue, used as a soft icon-badge background so the badge and title tie together visually.
const TINTS = ['bg-primary/15', 'bg-secondary/15', 'bg-accent/15'] as const

function hashSlug(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0
  return Math.abs(hash)
}

export function scenarioAccent(slug: string): string {
  return ACCENTS[hashSlug(slug) % ACCENTS.length]
}

export function scenarioTint(slug: string): string {
  return TINTS[hashSlug(slug) % TINTS.length]
}
