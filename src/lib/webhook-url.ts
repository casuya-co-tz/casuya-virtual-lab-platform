const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '[::1]'])

function isPrivateIpv4(host: string): boolean {
  const parts = host.split('.').map(Number)
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return false
  if (parts[0] === 10) return true
  if (parts[0] === 127) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  return false
}

export function isAllowedWebhookUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    const host = parsed.hostname.toLowerCase()
    if (BLOCKED_HOSTS.has(host)) return false
    if (host.endsWith('.local') || host.endsWith('.internal')) return false
    if (isPrivateIpv4(host)) return false
    return true
  } catch {
    return false
  }
}
