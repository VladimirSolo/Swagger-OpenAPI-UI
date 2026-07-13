import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionCookie } from '@/lib/auth/session';
import { recordHistoryEntry } from '@/lib/history/storage';
import { isBlockedTarget } from '@/lib/proxy/ssrf-guard';

/**
 * Headers that must not be forwarded verbatim (hop-by-hop, host/origin-specific,
 * or auto-set by fetch). `accept-encoding` is excluded so Node's own `fetch`
 * negotiates and auto-decompresses the upstream response itself — forwarding
 * the browser's original value can request an encoding our server doesn't
 * transparently decompress, corrupting the body we pass back to the browser.
 */
const EXCLUDED_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'cookie',
  'origin',
  'referer',
  'accept-encoding',
]);
const EXCLUDED_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
]);

/**
 * Transparent HTTP proxy: forwards the incoming request to `?target=<url>`
 * and mirrors back the upstream status/headers/body as-is. Used as the
 * `requestInterceptor` target for swagger-ui-react's Try-It-Out, so browser
 * requests to arbitrary APIs go through the server (avoiding CORS) and,
 * for authenticated users, get recorded for History & Analytics.
 */
async function handleProxy(request: NextRequest): Promise<Response> {
  const targetParam = request.nextUrl.searchParams.get('target');
  if (!targetParam) {
    return NextResponse.json({ error: 'Missing target query parameter' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(targetParam);
  } catch {
    return NextResponse.json({ error: 'Invalid target URL' }, { status: 400 });
  }

  if (isBlockedTarget(target)) {
    return NextResponse.json(
      { error: 'Requests to local/private network addresses are not allowed' },
      { status: 400 },
    );
  }

  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (!EXCLUDED_REQUEST_HEADERS.has(key.toLowerCase())) forwardHeaders.set(key, value);
  });

  const method = request.method;
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const requestBody = hasBody ? await request.arrayBuffer() : undefined;

  const startedAt = Date.now();
  let upstream: Response;
  let upstreamError: string | null = null;
  let responseBuffer = new ArrayBuffer(0);

  try {
    upstream = await fetch(target, { method, headers: forwardHeaders, body: requestBody });
    responseBuffer = await upstream.arrayBuffer();
  } catch (error) {
    upstreamError = error instanceof Error ? error.message : 'Request failed';
    upstream = new Response(null, { status: 502, statusText: 'Bad Gateway' });
  }

  const durationMs = Date.now() - startedAt;

  const cookieStore = await cookies();
  const session = await verifySessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (session) {
    try {
      await recordHistoryEntry(session.uid, {
        method,
        url: target.toString(),
        status: upstreamError ? null : upstream.status,
        durationMs,
        requestSize: requestBody?.byteLength ?? 0,
        responseSize: responseBuffer.byteLength,
        error: upstreamError,
      });
    } catch {
      // Analytics logging must never break the actual request/response flow.
    }
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!EXCLUDED_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value);
  });

  return new Response(responseBuffer, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as PATCH,
  handleProxy as DELETE,
  handleProxy as HEAD,
  handleProxy as OPTIONS,
};
