// Kana-only reading for each scenario's label, used as a small supporting line wherever a
// scenario name is shown (matching the kana-first convention used across the rest of the site).
// Keyed by slug rather than stored in phrases.json, since this is presentational only and should
// work the same whether scenarios are served from the bundled JSON or from Supabase.
export const SCENARIO_KANA: Record<string, string> = {
  greetings: 'あいさつ',
  shopping: 'かいもの',
  restaurant: 'しょくじ',
  'getting-around': 'いどう',
  hotel: 'ホテル',
  'bar-cocktails': 'バー',
  directions: 'みちあんない',
  emergencies: 'きんきゅう',
  'time-dates': 'じかんとひづけ',
  'language-barrier': 'ことばのかべ',
  'money-banking': 'おかね',
  'airport-arrival': 'くうこう',
  'lost-property-post': 'わすれもの',
  'supermarket-izakaya': 'スーパーといざかや',
  karaoke: 'カラオケ',
  sento: 'せんとう',
  'small-talk': 'ざつだん',
  onsen: 'おんせん',
  'pharmacy-health': 'やっきょく',
  'about-me': 'じこしょうかい',
  'tickets-games': 'チケットとゲーム',
  'bike-rental': 'レンタサイクル',
  'all-you-can-eat': 'たべほうだい',
  'entertainment-complex': 'ゲームセンター',
  'coin-laundry': 'コインランドリー',
  'shopkeeper-chat': 'みせのひと',
  shinkansen: 'しんかんせん',
  'weather-events': 'てんき',
  'apology-repair': 'しゃざい',
  'shrine-temple': 'じんじゃとおてら',
  'vending-machines': 'じはんき',
  'hair-salon': 'びようしつ',
  'gym-fitness': 'ジム',
  'otaku-culture': 'マンガとアニメ',
  'konbini-food': 'コンビニごはん',
  'making-friends': 'ともだちづくり',
  'grammar-connectors': 'ぶんぽう',
  'vocabulary-adjectives': 'たんごとけいようし',
}

export function scenarioKana(slug: string): string | undefined {
  return SCENARIO_KANA[slug]
}
