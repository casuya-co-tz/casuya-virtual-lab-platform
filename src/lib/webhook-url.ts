const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '[::1]'])

function isIpv4(host: string): boolean {
  const parts = host.split('.').map(Number)
  return parts.length === 4 && parts.every(n => Number.isInteger(n) && n >= 0 && n <= 255)
}

function isPrivateIpv4(host: string): boolean {
  if (!isIpv4(host)) return false
  const parts = host.split('.').map(Number)
  if (parts[0] === 10) return true
  if (parts[0] === 127) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  if (parts[0] === 169 && parts[1] === 254) return true
  if (parts[0] === 0) return true
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true // CGNAT
  return false
}

// Catch decimal/hex/octal integer IP forms (e.g. 2130706433, 0x7f000001)
function parseNumericHost(host: string): string | null {
  const numeric = /^(0x[0-9a-f]+|[0-9]+|0[0-7]+)$/i.test(host)
  if (!numeric) return null
  let value: number
  if (/^0x/i.test(host)) value = parseInt(host, 16)
  else if (/^0[0-7]+$/.test(host)) value = parseInt(host, 8)
  else value = parseInt(host, 10)
  if (!Number.isSafeInteger(value) || value > 0xffffffff) return null
  return `${(value >>> 24) & 255}.${(value >>> 16) & 255}.${(value >>> 8) & 255}.${value & 255}`
}

export function isAllowedWebhookUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'https:') return false

    let host = parsed.hostname.toLowerCase()
    if (host.endsWith('.')) host = host.slice(0, -1)

    if (BLOCKED_HOSTS.has(host)) return false
    if (host === '::1' || host === '[::1]') return false
    if (host.endsWith('.local') || host.endsWith('.internal')) return false
    // DNS-rebinding / localhost aliases
    if (host.endsWith('.nip.io') || host.endsWith('.localtest.me')) return false

    const numericHost = parseNumericHost(host)
    if (numericHost && isPrivateIpv4(numericHost)) return false

    if (isPrivateIpv4(host)) return false

    // Block IPv6 loopback/link-local/ULA forms
    if (host.includes(':')) {
      const normalized = host.replace(/^\[|\]$/g, '')
      const lower = normalized.toLowerCase()
      if (lower === '::1' || lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('::ffff:')) return false
    }

    return true
  } catch {
    return false
  }
}
