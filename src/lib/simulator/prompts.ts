import { Scenario } from '@/types';

const roles: Record<string, string> = {
  'bar-cocktails': 'craft bartender at a high-end cocktail bar in Tokyo',
  restaurant: 'server at a mid-range Japanese restaurant',
  shopping: 'shop assistant at a clothing store in Harajuku',
  transport: 'station staff member at a busy Tokyo train station',
  hotel: 'front desk staff at a business hotel',
  greetings: 'friendly local you just met',
  emergencies: 'helpful bystander',
  numbers: 'cashier at a convenience store',
  'small-talk': 'friendly local striking up casual conversation',
  sightseeing: 'tour guide at a popular landmark',
  onsen: 'staff member at a traditional hot spring inn',
  'about-me': 'curious local chatting with you at a social gathering',
  'pharmacy-health': 'pharmacist at a local drugstore',
};

export function getRoleForScenario(slug: string): string {
  return roles[slug] ?? 'Japanese local';
}

// Static opening line per scenario so the user never has to start cold —
// one fixed sentence per category (no extra API call, and it's TTS-cacheable).
const starters: Record<string, string> = {
  'bar-cocktails':
    'いらっしゃいませ、何になさいますか？\n[HINT: Welcome! What would you like to have?]',
  restaurant: 'いらっしゃいませ、何名様ですか？\n[HINT: Welcome! How many people?]',
  shopping:
    'いらっしゃいませ、何かお探しですか？\n[HINT: Welcome! Are you looking for something?]',
  transport: 'いらっしゃいませ、どちらまでですか？\n[HINT: Hello! Where are you headed?]',
  hotel:
    'いらっしゃいませ、ご予約のお客様でしょうか？\n[HINT: Welcome! Do you have a reservation?]',
  greetings: 'こんにちは！\n[HINT: Hello!]',
  emergencies: '大丈夫ですか？\n[HINT: Are you okay?]',
  numbers: 'いらっしゃいませ！\n[HINT: Welcome!]',
  'small-talk': "こんにちは、いい天気ですね。\n[HINT: Hello, nice weather, isn't it?]",
  sightseeing:
    'ようこそ！写真を撮りましょうか？\n[HINT: Welcome! Shall I take a photo for you?]',
  onsen:
    'いらっしゃいませ、タオルはこちらです。\n[HINT: Welcome! The towels are over here.]',
  'about-me':
    'わあ、日本は初めてですか？お名前を聞いてもいいですか？\n[HINT: Wow, is this your first time in Japan? May I ask your name?]',
  'pharmacy-health':
    'いらっしゃいませ、どうされましたか？\n[HINT: Welcome, what seems to be the problem?]',
};

export function getScenarioStarter(slug: string): string | undefined {
  return starters[slug];
}

// Ordered steps the AI walks through, so each conversation has a shape instead of only reacting
const flows: Record<string, string[]> = {
  restaurant: [
    'Greet and ask how many people are in the party',
    'Seat them and offer water or a drink',
    'Take the food order, asking about dishes and drinks',
    'Confirm the order back and ask about spice level or allergies',
    'Ask if anything else is needed, then bring the bill and ask how they want to pay',
  ],
  'bar-cocktails': [
    'Welcome them and ask what they would like to drink',
    'Recommend a drink and ask about taste preferences',
    'Ask whether they want it strong, sweet, or light',
    'Take the order and confirm it',
    'Ask if they want another round, then mention the bill',
  ],
  shopping: [
    'Greet them and ask what they are looking for',
    'Ask about size, colour, and style',
    'Show an option and recommend one',
    'Offer a fitting room and ask them to try it on',
    'Ask whether they want a bag and how they will pay',
  ],
  transport: [
    'Greet them and ask where they are headed',
    'Explain the line and the platform to take',
    'Ask whether they need a ticket or a pass',
    'Confirm the next train and the time',
    'Wish them a good trip',
  ],
  hotel: [
    'Greet them and ask whether they have a reservation',
    'Confirm the name and the dates',
    'Explain check-in and hand over the room key',
    'Ask about breakfast or any other requests',
    'Share the Wi-Fi and elevator details and say goodnight',
  ],
  greetings: [
    'Greet them and ask how they are doing',
    'Ask where they are from',
    'Ask how long they are staying in Japan',
    'Ask what they like to do here',
    'Say goodbye and invite them to chat again',
  ],
  emergencies: [
    'Check whether they are okay and ask what happened',
    'Ask where they are and whether they are hurt',
    'Ask whether they need the police or an ambulance',
    'Ask whether someone can be contacted for them',
    'Reassure them and stay with them until help arrives',
  ],
  numbers: [
    'Greet them and ask what they would like',
    'Ask how many or what size',
    'Tell them the price',
    'Ask whether they want a bag or have a point card',
    'Take the payment and thank them',
  ],
  'small-talk': [
    'Open with a friendly comment about the weather or the place',
    'Ask about their day',
    'Ask about their hobbies or plans',
    'Share a short opinion and ask a follow-up question',
    'Close warmly and suggest meeting again',
  ],
  sightseeing: [
    'Greet them and offer to help at the landmark',
    'Ask what they most want to see',
    'Explain the highlights',
    'Ask how much time they have',
    'Offer to take a photo and wish them a good visit',
  ],
  onsen: [
    'Greet them and hand over a towel and locker key',
    'Explain the bathing etiquette',
    'Ask whether they want a room or dinner',
    'Ask whether they need a yukata',
    'Wish them a relaxing bath',
  ],
  'about-me': [
    'Ask their name and where they are from',
    'Ask how they are finding Japan',
    'Ask what they do for work or study',
    'Ask what they enjoy doing for fun',
    'Ask for a way to contact them and suggest meeting again',
  ],
  'pharmacy-health': [
    'Ask what the problem is',
    'Ask how long it has lasted and where it hurts',
    'Ask about allergies or medicines they already take',
    'Recommend a medicine and explain how to take it',
    'Explain side effects and when to see a doctor',
  ],
};

export function getScenarioFlow(slug: string): string[] {
  return (
    flows[slug] ?? ['Keep the conversation natural and move it forward with a question']
  );
}

export function getSimulatorPrompt(scenario: Scenario): string {
  const phraseList = scenario.phrases
    .map((p) => `- ${p.japanese} (${p.english})`)
    .join('\n');
  const steps = getScenarioFlow(scenario.slug)
    .map((step, i) => `${i + 1}. ${step}`)
    .join('\n');

  return `You are a native Japanese ${getRoleForScenario(scenario.slug)} in Japan.
You are having a real conversation with a tourist who is learning Japanese.

RULES:
- The user may write to you in Japanese, English, or any other language — ALWAYS respond in Japanese regardless of what language they use. Never switch to another language, even if they do.
- Keep your responses short — 1 to 2 sentences maximum.
- Use natural, everyday Japanese appropriate for this context.
- If the user makes a mistake, gently use the correct form in your reply without pointing it out explicitly.
- React naturally to what they say — you are a real person, not a teacher.
- After every response, add a new line with: [HINT: English translation of what you just said]

LEADING THE CONVERSATION:
- You drive the conversation. Every reply moves to the next step below and ends with one clear question the tourist can answer.
- Follow the steps in order. Stay on the current step until the tourist has answered it, then move on.
- If the tourist goes off-topic or asks something unrelated, answer briefly, then bring it back to the current step.
- Use the phrases below naturally, so the tourist hears them in context.

SCENARIO: ${scenario.label}

STEPS:
${steps}

PHRASES THE USER IS PRACTICING:
${phraseList}

Stay in character. Begin with the first step.`;
}
