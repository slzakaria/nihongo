import { Scenario } from '@/types'

const roles: Record<string, string> = {
  'bar-cocktails': 'craft bartender at a high-end cocktail bar in Tokyo',
  restaurant: 'server at a mid-range Japanese restaurant',
  shopping: 'shop assistant at a clothing store in Harajuku',
  transport: 'station staff member at a busy Tokyo train station',
  hotel: 'front desk staff at a business hotel',
  directions: 'local resident on the street',
  greetings: 'friendly local you just met',
  emergencies: 'helpful bystander',
  numbers: 'cashier at a convenience store',
  'small-talk': 'friendly local striking up casual conversation',
  sightseeing: 'tour guide at a popular landmark',
  onsen: 'staff member at a traditional hot spring inn',
  'about-me': 'curious local chatting with you at a social gathering',
  'pharmacy-health': 'pharmacist at a local drugstore',
}

export function getRoleForScenario(slug: string): string {
  return roles[slug] ?? 'Japanese local'
}

// Static opening line per scenario so the user never has to start cold —
// one fixed sentence per category (no extra API call, and it's TTS-cacheable).
const starters: Record<string, string> = {
  'bar-cocktails': 'いらっしゃいませ、何になさいますか？\n[HINT: Welcome! What would you like to have?]',
  restaurant: 'いらっしゃいませ、何名様ですか？\n[HINT: Welcome! How many people?]',
  shopping: 'いらっしゃいませ、何かお探しですか？\n[HINT: Welcome! Are you looking for something?]',
  transport: 'いらっしゃいませ、どちらまでですか？\n[HINT: Hello! Where are you headed?]',
  hotel: 'いらっしゃいませ、ご予約のお客様でしょうか？\n[HINT: Welcome! Do you have a reservation?]',
  directions: 'こんにちは、お困りですか？\n[HINT: Hello, do you need help?]',
  greetings: 'こんにちは！\n[HINT: Hello!]',
  emergencies: '大丈夫ですか？\n[HINT: Are you okay?]',
  numbers: 'いらっしゃいませ！\n[HINT: Welcome!]',
  'small-talk': 'こんにちは、いい天気ですね。\n[HINT: Hello, nice weather, isn\'t it?]',
  sightseeing: 'ようこそ！写真を撮りましょうか？\n[HINT: Welcome! Shall I take a photo for you?]',
  onsen: 'いらっしゃいませ、タオルはこちらです。\n[HINT: Welcome! The towels are over here.]',
  'about-me': 'わあ、日本は初めてですか？お名前を聞いてもいいですか？\n[HINT: Wow, is this your first time in Japan? May I ask your name?]',
  'pharmacy-health': 'いらっしゃいませ、どうされましたか？\n[HINT: Welcome, what seems to be the problem?]',
}

export function getScenarioStarter(slug: string): string | undefined {
  return starters[slug]
}

export function getSimulatorPrompt(scenario: Scenario): string {
  const phraseList = scenario.phrases.map(p => `- ${p.japanese} (${p.english})`).join('\n')

  return `You are a native Japanese ${getRoleForScenario(scenario.slug)} in Japan.
You are having a real conversation with a tourist who is learning Japanese.

RULES:
- Respond ONLY in Japanese. Never use English unless the user explicitly asks.
- Keep your responses short — 1 to 2 sentences maximum.
- Use natural, everyday Japanese appropriate for this context.
- If the user makes a mistake, gently use the correct form in your reply without pointing it out explicitly.
- React naturally to what they say — you are a real person, not a teacher.
- After every response, add a new line with: [HINT: English translation of what you just said]

SCENARIO: ${scenario.label}

PHRASES THE USER IS PRACTICING:
${phraseList}

Stay in character. Begin the interaction naturally when the user speaks.`
}
