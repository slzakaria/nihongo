// app/api/simulator/route.ts
import Anthropic from '@anthropic-ai/sdk'
import { scenarios } from '@/lib/data/phrases'
import { getSimulatorPrompt } from '@/lib/simulator/prompts'

const client = new Anthropic()

export async function POST(req: Request) {
const { messages, scenarioSlug } = await req.json()

const scenario = scenarios.find(s => s.slug === scenarioSlug)
if (!scenario) return Response.json({ error: 'Unknown scenario' }, { status: 400 })

const stream = await client.messages.stream({
model: 'claude-sonnet-4-6',
max_tokens: 400,
system: getSimulatorPrompt(scenario),
messages,
})

// Stream the response back
return new Response(stream.toReadableStream())
}
