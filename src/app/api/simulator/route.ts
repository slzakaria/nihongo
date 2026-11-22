import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { loadContent } from '@/lib/data/content';
import { getSimulatorPrompt } from '@/lib/simulator/prompts';
import { currentServerUser } from '@/lib/auth/server';
import { checkAndBumpDailyLimit, rateLimitResponse } from '@/lib/rateLimit';
import { ChatMessage } from '@/types';
import { isJsonRecord, readJsonRequestBody } from '@/lib/http/requestBody';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOTAL_MESSAGE_LENGTH = 24000;

export async function POST(req: NextRequest) {
  const parsed = await readJsonRequestBody(req, 32 * 1024);
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }
  if (
    !isJsonRecord(parsed.value) ||
    typeof parsed.value.scenarioSlug !== 'string' ||
    !Array.isArray(parsed.value.messages) ||
    parsed.value.messages.length === 0 ||
    parsed.value.messages.length > MAX_MESSAGES
  ) {
    return Response.json({ error: 'Invalid conversation' }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  let totalMessageLength = 0;
  for (const message of parsed.value.messages) {
    if (
      !isJsonRecord(message) ||
      (message.role !== 'user' && message.role !== 'assistant') ||
      typeof message.content !== 'string' ||
      message.content.length > MAX_MESSAGE_LENGTH
    ) {
      return Response.json({ error: 'Invalid conversation' }, { status: 400 });
    }
    totalMessageLength += message.content.length;
    if (totalMessageLength > MAX_TOTAL_MESSAGE_LENGTH) {
      return Response.json({ error: 'Conversation is too long' }, { status: 400 });
    }
    messages.push({ role: message.role, content: message.content });
  }
  const { scenarioSlug } = parsed.value;

  const scenario = (await loadContent()).phrases.find((s) => s.slug === scenarioSlug);
  if (!scenario) {
    return Response.json({ error: 'Unknown scenario' }, { status: 400 });
  }

  const user = await currentServerUser();
  const rateLimit = await checkAndBumpDailyLimit(req, 'anthropic', user?.id ?? null);
  const rateLimitError = rateLimitResponse(rateLimit);
  if (rateLimitError) return rateLimitError;

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: getSimulatorPrompt(scenario),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('text', (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
