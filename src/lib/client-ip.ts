const IPV4_RE = /^\d{1,3}(?:\.\d{1,3}){3}$/
const IPV6_RE = /^[0-9a-fA-F:]{2,45}$/

function looksLikeIp(value: string): boolean {
  return IPV4_RE.test(value) || IPV6_RE.test(value)
}

/**
 * Extracts a client IP from the `x-forwarded-for` chain, falling back to the
 * runtime-provided IP when the header is absent or malformed. The header value
 * is the original client followed by each proxy hop, so the first element is
 * used. Values that are not plausible IP literals are discarded so spoofed
 * garbage cannot be injected into rate-limit keys or audit logs.
 */
export function getClientIp(xForwardedFor: string | null | undefined, runtimeIp?: string | null): string {
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0].trim()
    const withoutPort = first.replace(/^\[([^\]]+)\].*$/, '$1')
    const candidate = withoutPort.includes(':') && !withoutPort.startsWith('[') && withoutPort.split(':').length > 2
      ? withoutPort
      : withoutPort.split(':')[0]
    if (candidate && looksLikeIp(candidate)) {
      return candidate
    }
  }

  if (runtimeIp && looksLikeIp(runtimeIp)) {
    return runtimeIp
  }

  return 'unknown'
}
