import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, trackApiUsage, enforceDeveloperQuota, hasApiScope } from '@/lib/api-tracker'
import { getLab } from '@/lib/lab-manager'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
    const lab = await getLab(params.id)

    await trackApiUsage(
      auth.credentialId,
      `/api/v1/labs/${params.id}`,
      lab ? 200 : 404,
      req.headers.get('x-forwarded-for') || undefined
    )

    if (!lab) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }
    return NextResponse.json(lab)
  } catch {
    await trackApiUsage(auth.credentialId, `/api/v1/labs/${params.id}`, 500, req.headers.get('x-forwarded-for') || undefined)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
