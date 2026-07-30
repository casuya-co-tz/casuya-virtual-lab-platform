import { NextResponse } from 'next/server'
import { getLabs } from '@/lib/lab-manager'

export async function GET() {
  try {
    const result = await getLabs({ page: 1, limit: 20 })
    return NextResponse.json({
      labs: result.data,
      tier: 'public',
      message: 'Free public API — no key required. Rate limit: 30 req/min.',
    }, {
      headers: { 'Cache-Control': 'public, max-age=60, immutable' },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
