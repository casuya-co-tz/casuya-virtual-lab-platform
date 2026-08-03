import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { validateEnterpriseApiKey, trackApiUsage } from '@/lib/api-tracker'
import { getLabs } from '@/lib/lab-manager'
import { getClientIp } from '@/lib/client-ip'

export async function GET(request: NextRequest) {
  try {
    const auth = await validateEnterpriseApiKey(request.headers.get('authorization'))
    if (!auth) {
      return NextResponse.json({ error: 'Invalid API key or enterprise tier required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'labs'
    const parsedPage = parseInt(searchParams.get('page') || '1')
    const parsedLimit = parseInt(searchParams.get('limit') || '50')
    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1
    const limit = Number.isFinite(parsedLimit) ? Math.min(100, Math.max(1, parsedLimit)) : 50

    if (endpoint === 'labs') {
      const result = await getLabs({ page, limit })
      await trackApiUsage(auth.credentialId, '/api/v1/enterprise?endpoint=labs', 200, getClientIp(request.headers.get('x-forwarded-for'), request.ip))
      return NextResponse.json({ labs: result.data, pagination: { page, limit, total: result.total }, tier: 'enterprise' })
    }

    if (endpoint === 'usage') {
      const result = await query(
        `SELECT endpoint, status_code, COUNT(*) as count
         FROM api_usage
         WHERE credential_id = $1
         GROUP BY endpoint, status_code
         ORDER BY count DESC
         LIMIT 50`,
        [auth.credentialId]
      )
      await trackApiUsage(auth.credentialId, '/api/v1/enterprise?endpoint=usage', 200, getClientIp(request.headers.get('x-forwarded-for'), request.ip))
      return NextResponse.json({ usage: result.rows, tier: 'enterprise' })
    }

    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
