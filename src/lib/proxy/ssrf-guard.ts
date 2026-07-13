const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1']);

/** IPv4 prefixes that are loopback, private, or link-local (incl. cloud metadata). */
const BLOCKED_IPV4_PREFIXES = ['127.', '10.', '169.254.', '192.168.'];

function isBlockedIpv4(hostname: string): boolean {
  if (BLOCKED_IPV4_PREFIXES.some((prefix) => hostname.startsWith(prefix))) return true;

  // 172.16.0.0 – 172.31.255.255
  const match = /^172\.(\d{1,3})\./.exec(hostname);
  if (match) {
    const second = Number(match[1]);
    return second >= 16 && second <= 31;
  }

  return false;
}

/**
 * Blocks requests targeting loopback/private/link-local addresses to reduce
 * SSRF risk. This is a best-effort check on the hostname as provided by the
 * caller — it does not protect against DNS-rebinding or redirect-based SSRF
 * (a malicious server issuing a redirect to an internal address).
 */
export function isBlockedTarget(url: URL): boolean {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) return true;
  if (hostname.endsWith('.localhost')) return true;
  if (isBlockedIpv4(hostname)) return true;
  if (hostname.startsWith('fc') || hostname.startsWith('fd') || hostname.startsWith('fe80')) {
    return true; // IPv6 unique-local / link-local
  }

  return false;
}
