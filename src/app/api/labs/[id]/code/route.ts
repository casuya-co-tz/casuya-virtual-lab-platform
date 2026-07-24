import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { sanitizeLabCode } from '@/lib/lab-processor'
import { cookies } from 'next/headers'

interface Props {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = params
    const result = await query(
      'SELECT html_threejs_code, is_published, is_premium FROM labs WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

    const lab = result.rows[0]

    if (!lab.is_published) {
      return NextResponse.json({ error: 'Lab not published' }, { status: 403 })
    }

    if (lab.is_premium) {
      const cookieStore = await cookies()
      const sid = cookieStore.get('sid')?.value
      if (!sid) {
        return NextResponse.json({ error: 'Subscription required', upgradeUrl: '/pricing' }, { status: 403 })
      }
      const subResult = await query(
        `SELECT id FROM subscriptions WHERE user_id = $1 AND status = 'active' AND tier IN ('premium', 'enterprise')`,
        [sid]
      )
      if (subResult.rows.length === 0) {
        return NextResponse.json({ error: 'Subscription required', upgradeUrl: '/pricing' }, { status: 403 })
      }
    }

    if (!lab.html_threejs_code) {
      return NextResponse.json({ error: 'No code available' }, { status: 404 })
    }

    const sanitized = sanitizeLabCode(lab.html_threejs_code)

    return new NextResponse(sanitized, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
