export function parseBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

/** Developer keys use `public_token:secret` (e.g. cvs_abc123:hexsecret). */
export function isDeveloperKeyFormat(token: string): boolean {
  const parts = token.split(':')
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0
}
