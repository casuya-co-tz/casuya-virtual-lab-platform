import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { sanitizeLabCode } from '@/lib/lab-processor'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const result = await query(
      'SELECT html_threejs_code, is_published FROM labs WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

    const lab = result.rows[0]

    if (!lab.is_published) {
      return NextResponse.json({ error: 'Lab not published' }, { status: 403 })
    }

    if (!lab.html_threejs_code) {
      return NextResponse.json({ error: 'No code available' }, { status: 404 })
    }

    const sanitized = sanitizeLabCode(lab.html_threejs_code)

    return new NextResponse(sanitized, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
