import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { isDeveloperKeyFormat, parseBearerToken } from '@/lib/api-key-format'

export { isDeveloperKeyFormat, parseBearerToken }

export async function getDeveloperUsageLastMinute(developerId: string): Promise<number> {
  const usageResult = await query(
    `SELECT COUNT(*) as cnt FROM api_usage au
     JOIN api_credentials ac ON ac.id = au.credential_id
     WHERE ac.developer_id = $1 AND au.created_at > NOW() - INTERVAL '1 minute'`,
    [developerId]
  )
  return parseInt(usageResult.rows[0]?.cnt || '0', 10)
}

export function hasApiScope(scopes: string[], required: string): boolean {
  return scopes.includes('*') || scopes.includes(required)
}

export async function enforceDeveloperQuota(developerId: string) {
  const currentUsage = await getDeveloperUsageLastMinute(developerId)
  const result = await query(
    `SELECT pp.rate_limit_per_min, pp.slug
     FROM developer_profiles dp
     JOIN pricing_plans pp ON pp.id = dp.plan_id
     WHERE dp.id = $1`,
    [developerId]
  )

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'UNVERIFIED_DEVELOPER_CREDENTIALS' }, { status: 403 })
  }

  const limit = result.rows[0].rate_limit_per_min

  if (limit !== null && currentUsage >= limit) {
    return NextResponse.json(
      {
        error: 'RESOURCE_POOL_EXHAUSTED',
        message: 'Your developer tier rate limit has been exceeded.',
        upgradeUrl: '/pricing?section=developer',
      },
      { status: 429 }
    )
  }

  return null
}

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

export async function validateEnterpriseApiKey(
  authHeader: string | null
): Promise<{ credentialId: string; scopes: string[]; developerId: string } | null> {
  const auth = await validateApiKey(authHeader)
  if (!auth) return null

  const result = await query(
    `SELECT ac.developer_id, dp.api_tier
     FROM api_credentials ac
     JOIN developer_profiles dp ON dp.id = ac.developer_id
     WHERE ac.id = $1 AND ac.is_active = true`,
    [auth.credentialId]
  )
  if (result.rows.length === 0 || result.rows[0].api_tier !== 'enterprise') return null

  return { ...auth, developerId: result.rows[0].developer_id }
}
