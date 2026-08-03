import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { validateEnterpriseApiKey } from '@/lib/api-tracker'

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await validateEnterpriseApiKey(request.headers.get('authorization'))
    if (!auth) {
      return NextResponse.json({ error: 'Invalid API key or enterprise tier required' }, { status: 401 })
    }

    const result = await query(
      `UPDATE api_credentials SET is_active = false WHERE id = $1 AND developer_id = $2 RETURNING id, public_token, is_active`,
      [params.id, auth.developerId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    return NextResponse.json({ revoked: true, credential: result.rows[0] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
