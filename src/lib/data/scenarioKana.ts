// Kana-only reading for each scenario's label, used as a small supporting line wherever a
// scenario name is shown (matching the kana-first convention used across the rest of the site).
// Keyed by slug rather than stored in phrases.json, since this is presentational only and should
// work the same whether scenarios are served from the bundled JSON or from Supabase.
// Katakana is used only for genuine loanwords (ホテル, カラオケ, ジム, etc.); everything else is
// native/Sino-Japanese vocabulary in hiragana. Two-concept English titles (e.g. "Bar & Cocktails")
// get a matching two-concept reading joined with と, rather than naming only one half.
export const SCENARIO_KANA: Record<string, string> = {
  greetings: 'あいさつ',
  shopping: 'かいもの',
  restaurant: 'しょくじとコンビニ',
  'getting-around': 'いどう',
  hotel: 'ホテル',
  'bar-cocktails': 'バーとカクテル',
  directions: 'みちあんない',
  emergencies: 'きんきゅうとけいさつ',
  'time-dates': 'じかんとひづけ',
  'language-barrier': 'ことばのかべ',
  'money-banking': 'おかねとぎんこう',
  'airport-arrival': 'くうこうとうちゃく',
  'lost-property-post': 'ゆうびんとわすれもの',
  'supermarket-izakaya': 'スーパーといざかや',
  karaoke: 'カラオケ',
  'small-talk': 'ざつだん',
  onsen: 'おんせんとせんとう',
  'pharmacy-health': 'やっきょくとけんこう',
  'about-me': 'じこしょうかい',
  'tickets-games': 'チケットとゲーム',
  'bike-rental': 'レンタサイクル',
  'all-you-can-eat': 'たべほうだい・のみほうだい',
  'entertainment-complex': 'ゲームセンター',
  'coin-laundry': 'コインランドリー',
  'shopkeeper-chat': 'てんいん',
  shinkansen: 'しんかんせん',
  'weather-events': 'てんきとしぜんげんしょう',
  'apology-repair': 'くじょうとしゃざい',
  'shrine-temple': 'かんこうとじんじゃ',
  'vending-machines': 'じはんき',
  'hair-salon': 'びよういんととこや',
  'gym-fitness': 'ジム',
  'otaku-culture': 'マンガとアニメ',
  'konbini-food': 'コンビニごはん',
  'making-friends': 'ともだちづくり',
  'grammar-connectors': 'ぶんぽう',
  'vocabulary-adjectives': 'たんごとけいようし',
};

export function scenarioKana(slug: string): string | undefined {
  return SCENARIO_KANA[slug];
}
