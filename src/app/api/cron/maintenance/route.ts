import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const TABLES = ['labs', 'lab_progress', 'profiles', 'subscriptions', 'web_vitals', 'reviews']

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, string> = {}
  let allOk = true

  for (const table of TABLES) {
    try {
      await query(`VACUUM ANALYZE ${table}`)
      results[table] = 'ok'
    } catch (err: any) {
      allOk = false
      results[table] = err?.message || 'error'
    }
  }

  return NextResponse.json(
    {
      success: allOk,
      results,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 500 }
  )
}
