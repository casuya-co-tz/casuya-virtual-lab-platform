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

  for (const table of TABLES) {
    try {
      await query(`VACUUM ANALYZE ${table}`)
      results[table] = 'ok'
    } catch (err: any) {
      results[table] = err.message
    }
  }

  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  })
}
