import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { logAuditEvent } from '@/lib/audit-logger'

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    const existing = await query('SELECT id FROM auth.users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = bcrypt.hashSync(password, 10)
    const userResult = await query(
      `INSERT INTO auth.users (email, encrypted_password, role)
       VALUES ($1, $2, 'student') RETURNING id`,
      [email, hashed]
    )

    const userId = userResult.rows[0].id
    await query(
      'INSERT INTO profiles (id, full_name, role, language) VALUES ($1, $2, $3, $4)',
      [userId, fullName || email.split('@')[0], 'student', 'en']
    )

    const cookieStore = await cookies()
    cookieStore.set('sid', userId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('role', 'student', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    await logAuditEvent({ userId, action: 'signup', entityType: 'user', ipAddress: ip, newValues: { email } })

    return NextResponse.json({ user: { id: userId, full_name: fullName, role: 'student' } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
