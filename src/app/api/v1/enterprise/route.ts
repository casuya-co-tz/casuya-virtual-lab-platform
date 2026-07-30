import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { validateEnterpriseApiKey } from '@/lib/api-tracker'
import { getLabs } from '@/lib/lab-manager'

export async function GET(request: NextRequest) {
  try {
    const auth = await validateEnterpriseApiKey(request.headers.get('authorization'))
    if (!auth) {
      return NextResponse.json({ error: 'Invalid API key or enterprise tier required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'labs'

    if (endpoint === 'labs') {
      const result = await getLabs({ limit: 100 })
      return NextResponse.json({ labs: result.data, tier: 'enterprise' })
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
      return NextResponse.json({ usage: result.rows, tier: 'enterprise' })
    }

    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
