import { NextRequest, NextResponse } from 'next/server'
import { searchLabs } from '@/lib/lab-manager'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ data: [], total: 0 })
    }

    const result = await searchLabs(q)

    return NextResponse.json({ data: result.results, total: result.results.length })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
