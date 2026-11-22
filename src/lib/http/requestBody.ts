import type { NextRequest } from 'next/server';

export type BodyReadResult =
  { ok: true; bytes: Uint8Array } | { ok: false; status: 400 | 413; error: string };

export function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function readBoundedRequestBody(
  req: NextRequest,
  maxBytes: number,
): Promise<BodyReadResult> {
  const contentLength = req.headers.get('content-length');
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      return { ok: false, status: 400, error: 'Invalid content length' };
    }
    if (Number(contentLength) > maxBytes) {
      return { ok: false, status: 413, error: 'Request body is too large' };
    }
  }

  const reader = req.body?.getReader();
  if (!reader) {
    return { ok: false, status: 400, error: 'Request body is required' };
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      return { ok: false, status: 413, error: 'Request body is too large' };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, bytes };
}

export async function readJsonRequestBody(
  req: NextRequest,
  maxBytes: number,
): Promise<{ ok: true; value: unknown } | Exclude<BodyReadResult, { ok: true }>> {
  const body = await readBoundedRequestBody(req, maxBytes);
  if (!body.ok) return body;

  try {
    return {
      ok: true,
      value: JSON.parse(new TextDecoder().decode(body.bytes)),
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, status: 400, error: 'Invalid JSON body' };
    }
    throw error;
  }
}
