import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { readBoundedRequestBody, readJsonRequestBody } from '@/lib/http/requestBody';

function request(body: string) {
  return new NextRequest('https://example.test/api', {
    method: 'POST',
    body,
  });
}

describe('bounded request bodies', () => {
  it('parses valid JSON within the configured size limit', async () => {
    await expect(readJsonRequestBody(request('{"text":"hello"}'), 100)).resolves.toEqual({
      ok: true,
      value: { text: 'hello' },
    });
  });

  it('rejects malformed JSON', async () => {
    await expect(readJsonRequestBody(request('{'), 100)).resolves.toEqual({
      ok: false,
      status: 400,
      error: 'Invalid JSON body',
    });
  });

  it('rejects oversized streamed bodies', async () => {
    await expect(readBoundedRequestBody(request('123456'), 5)).resolves.toEqual({
      ok: false,
      status: 413,
      error: 'Request body is too large',
    });
  });
});
