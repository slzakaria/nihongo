import Anthropic, { AnthropicError } from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { loadContent } from '@/lib/data/content';
import { getSimulatorPrompt } from '@/lib/simulator/prompts';
import { currentServerUser } from '@/lib/auth/server';
import { checkAndBumpDailyLimit, rateLimitResponse } from '@/lib/rateLimit';
import { ChatMessage } from '@/types';
import { isJsonRecord, readJsonRequestBody } from '@/lib/http/requestBody';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const MAX_MESSAGES = 50;
const MAX_HISTORY_TURNS = 10; // sliding window sent to Claude
const MAX_MESSAGE_LENGTH = 3000;
const MAX_TOTAL_MESSAGE_LENGTH = 26000;

export async function POST(req: NextRequest) {
  // ── Parse & validate body ──────────────────────────────────────────────────
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

  // ── Validate & collect messages ────────────────────────────────────────────
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

  // ── Resolve scenario ───────────────────────────────────────────────────────
  const { scenarioSlug } = parsed.value;
  const scenario = (await loadContent()).phrases.find((s) => s.slug === scenarioSlug);
  if (!scenario) {
    return Response.json({ error: 'Unknown scenario' }, { status: 400 });
  }

  // ── Auth & rate limit ──────────────────────────────────────────────────────
  const user = await currentServerUser();
  const rateLimit = await checkAndBumpDailyLimit(req, 'anthropic', user?.id ?? null);
  const rateLimitError = rateLimitResponse(rateLimit);
  if (rateLimitError) return rateLimitError;

  // ── Trim history sent to Claude ────────────────────────────────────────────
  // Keep the full messages array for validation above, but only send a
  // rolling window to Claude to avoid inflating costs on long sessions.
  // Always preserve the first user message so Claude has the opening context.
  const trimmedMessages =
    messages.length > MAX_HISTORY_TURNS
      ? [messages[0], ...messages.slice(-MAX_HISTORY_TURNS + 1)]
      : messages;

  // ── Stream ─────────────────────────────────────────────────────────────────
  let stream: ReturnType<typeof client.messages.stream>;

  try {
    stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      temperature: 0.7,
      system: [
        {
          type: 'text' as const,
          text: getSimulatorPrompt(scenario),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: trimmedMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  } catch (err) {
    console.error('[simulator] Failed to open stream:', err);
    return Response.json({ error: 'Failed to start conversation' }, { status: 502 });
  }

  // ── Readable stream with error propagation ─────────────────────────────────
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('text', (delta: string) => {
        try {
          controller.enqueue(encoder.encode(delta));
        } catch {
          // Controller already closed — client disconnected mid-stream
        }
      });

      stream.on('end', () => {
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });

      stream.on('error', (err: AnthropicError) => {
        console.error('[simulator] Stream error:', err);
        try {
          // Send a readable error marker before closing so the client
          // can detect it and show a UI message rather than a broken reply
          controller.enqueue(
            encoder.encode('\n[ERROR: Connection lost. Please try again.]'),
          );
          controller.close();
        } catch {
          controller.error(err);
        }
      });
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });
}
