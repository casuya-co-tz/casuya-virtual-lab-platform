import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const dbCheck = await query('SELECT NOW() as time').catch(() => null)
    const dbOk = !!dbCheck

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbOk ? 'connected' : 'disconnected',
      version: process.env.npm_package_version || '0.1.0',
    })
  } catch {
    return NextResponse.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'error',
    }, { status: 503 })
  }
}
