// lib/simulator/prompts.ts
export function getSimulatorPrompt(scenario: Scenario): string {
const phraseList = scenario.phrases
.map(p => `- ${p.japanese} (${p.english})`)
.join('\n')

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

function getRoleForScenario(slug: string): string {
const roles: Record<string, string> = {
'bar-cocktails': 'craft bartender at a high-end cocktail bar in Tokyo',
'restaurant': 'server at a mid-range Japanese restaurant',
'shopping': 'shop assistant at a clothing store in Harajuku',
'transport': 'station staff member at a busy Tokyo train station',
'hotel': 'front desk staff at a business hotel',
'directions': 'local resident on the street',
'greetings': 'friendly local you just met',
'emergencies': 'helpful bystander',
'numbers': 'cashier at a convenience store',
}
return roles[slug] ?? 'Japanese local'
}
