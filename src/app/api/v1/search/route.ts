import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, trackApiUsage, enforceDeveloperQuota, hasApiScope } from '@/lib/api-tracker'
import { searchLabs } from '@/lib/lab-manager'

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
      const q = searchParams.get('q')
      const subject = searchParams.get('subject') || undefined
      const thumbnail = searchParams.get('thumbnail')
      if (!q || q.trim().length < 2) {
        return NextResponse.json({ data: [], total: 0 })
      }

      const result = await searchLabs(q, subject)

    await trackApiUsage(auth.credentialId, '/api/v1/search', 200, req.headers.get('x-forwarded-for') || undefined)

    return NextResponse.json({ data: result.results, total: result.results.length })
  } catch {
    await trackApiUsage(auth.credentialId, '/api/v1/search', 500, req.headers.get('x-forwarded-for') || undefined)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
