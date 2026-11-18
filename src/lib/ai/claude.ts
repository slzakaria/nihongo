import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
export const CLAUDE_MODEL = 'claude-sonnet-4-6'

// Asks Claude for a JSON object and parses it. Throws if the reply has no JSON.
export async function askClaudeJson<T>(system: string, user: string, maxTokens = 600): Promise<T> {
  const res = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const text = res.content.map(block => (block.type === 'text' ? block.text : '')).join('')
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Claude reply did not contain JSON')
  return JSON.parse(match[0]) as T
}
