import { query } from '@/lib/db'

export async function trackApiUsage(credentialId: string, endpoint: string, statusCode: number, ipAddress?: string) {
  try {
    await query(
      'INSERT INTO api_usage (credential_id, endpoint, status_code, ip_address) VALUES ($1, $2, $3, $4)',
      [credentialId, endpoint, statusCode, ipAddress && /^[0-9.:]+$/.test(ipAddress) ? ipAddress : null]
    )
    await query(
      'UPDATE api_credentials SET request_count = request_count + 1, last_used_at = NOW() WHERE id = $1',
      [credentialId]
    )
  } catch {
    // silent fail — usage tracking should never break requests
  }
}

export async function validateApiKey(authHeader: string | null): Promise<{ credentialId: string; scopes: string[] } | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const parts = token.split(':')
  if (parts.length !== 2) return null

  const [publicToken, secret] = parts
  try {
    const result = await query(
      'SELECT id, hashed_secret, scopes, is_active, request_count FROM api_credentials WHERE public_token = $1',
      [publicToken]
    )
    if (result.rows.length === 0) return null
    const cred = result.rows[0]
    if (!cred.is_active) return null

    const bcrypt = await import('bcryptjs')
    const valid = bcrypt.default.compareSync(secret, cred.hashed_secret)
    if (!valid) return null

    return { credentialId: cred.id, scopes: cred.scopes }
  } catch {
    return null
  }
}
