import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('sid')?.value

  if (sessionId) {
    await query(
      'UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL',
      [sessionId]
    ).catch(() => {})
  }

  cookieStore.set('sid', '', { httpOnly: true, path: '/', maxAge: 0 })
  cookieStore.set('role', '', { httpOnly: true, path: '/', maxAge: 0 })
  return NextResponse.json({ ok: true })
}
