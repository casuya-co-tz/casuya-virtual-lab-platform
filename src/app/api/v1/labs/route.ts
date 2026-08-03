import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, trackApiUsage, enforceDeveloperQuota, hasApiScope } from '@/lib/api-tracker'
import { getLabs, getLab } from '@/lib/lab-manager'

export async function GET(req: NextRequest) {
  const auth = await validateApiKey(req.headers.get('authorization'))
  if (!auth) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }
  if (!hasApiScope(auth.scopes, 'labs:read')) {
    return NextResponse.json({ error: 'Insufficient scope. Required: labs:read' }, { status: 403 })
  }

  const devResult = await (await import('@/lib/db')).query('SELECT developer_id FROM api_credentials WHERE id = $1', [auth.credentialId])
  if (devResult.rows.length > 0) {
    const quotaError = await enforceDeveloperQuota(devResult.rows[0].developer_id)
    if (quotaError) return quotaError
  }

  try {
    const { searchParams } = new URL(req.url)
    const subject = searchParams.get('subject') || undefined
    const parsedPage = parseInt(searchParams.get('page') || '1')
    const parsedLimit = parseInt(searchParams.get('limit') || '20')
    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1
    const limit = Number.isFinite(parsedLimit) ? Math.min(100, Math.max(1, parsedLimit)) : 20

    const result = await getLabs({ subject, page, limit })

    await trackApiUsage(auth.credentialId, '/api/v1/labs', 200, req.headers.get('x-forwarded-for') || undefined)

    return NextResponse.json(result)
  } catch {
    await trackApiUsage(auth.credentialId, '/api/v1/labs', 500, req.headers.get('x-forwarded-for') || undefined)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
