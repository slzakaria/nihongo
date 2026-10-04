import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import { getScenarioBySlug } from '@/lib/data/phrases'
import { getSimulatorPrompt } from '@/lib/simulator/prompts'
import { ChatMessage } from '@/types'

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

export async function POST(req: NextRequest) {
  const { messages, scenarioSlug } = (await req.json()) as {
    messages: ChatMessage[]
    scenarioSlug: string
  }

  const scenario = getScenarioBySlug(scenarioSlug)
  if (!scenario) {
    return Response.json({ error: 'Unknown scenario' }, { status: 400 })
  }

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: getSimulatorPrompt(scenario),
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('text', delta => controller.enqueue(encoder.encode(delta)))
      stream.on('end', () => controller.close())
      stream.on('error', err => controller.error(err))
    },
    cancel() {
      stream.controller.abort()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
