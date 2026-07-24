import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, title, description, status, severity, started_at, resolved_at, updates
       FROM incidents
       ORDER BY started_at DESC
       LIMIT 20`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json([])
  }
}
