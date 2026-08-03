import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, trackApiUsage, enforceDeveloperQuota, hasApiScope } from '@/lib/api-tracker'
import { getLab } from '@/lib/lab-manager'
import { getClientIp } from '@/lib/client-ip'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await validateApiKey(req.headers.get('authorization'))
  if (!auth) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
  if (!hasApiScope(auth.scopes, 'labs:read')) {
    return NextResponse.json({ error: 'Insufficient scope. Required: labs:read' }, { status: 403 })
  }

  const db = await import('@/lib/db')
  const devResult = await db.query('SELECT developer_id FROM api_credentials WHERE id = $1', [auth.credentialId])
  let apiTier = 'free'
  if (devResult.rows.length > 0) {
    const quotaError = await enforceDeveloperQuota(devResult.rows[0].developer_id)
    if (quotaError) return quotaError
    const tierResult = await db.query('SELECT api_tier FROM developer_profiles WHERE id = $1', [devResult.rows[0].developer_id])
    apiTier = tierResult.rows[0]?.api_tier || 'free'
  }

  try {
    const lab = await getLab(params.id)

    await trackApiUsage(
      auth.credentialId,
      `/api/v1/labs/${params.id}`,
      lab ? 200 : 404,
      getClientIp(req.headers.get('x-forwarded-for'))
    )

    if (!lab) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

    const entitled = apiTier === 'premium' || apiTier === 'enterprise'
    if (lab.is_premium && !entitled) {
      const { html_code, scoring_config, ...rest } = lab
      return NextResponse.json({ ...rest, html_code: null, scoring_config: null })
    }

    return NextResponse.json(lab)
  } catch {
    await trackApiUsage(auth.credentialId, `/api/v1/labs/${params.id}`, 500, getClientIp(req.headers.get('x-forwarded-for')))
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
