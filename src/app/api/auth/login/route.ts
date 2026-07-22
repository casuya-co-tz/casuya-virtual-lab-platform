import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { logAuditEvent } from '@/lib/audit-logger'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    const userResult = await query(
      'SELECT id, email, encrypted_password, role FROM auth.users WHERE email = $1',
      [email]
    )
    if (userResult.rows.length === 0) {
      await logAuditEvent({ userId: null, action: 'login_failed', entityType: 'user', ipAddress: ip, newValues: { email } })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const authUser = userResult.rows[0]
    const valid = bcrypt.compareSync(password, authUser.encrypted_password)
    if (!valid) {
      await logAuditEvent({ userId: authUser.id, action: 'login_failed', entityType: 'user', ipAddress: ip })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    let profileResult = await query(
      'SELECT id, full_name, role, language FROM profiles WHERE id = $1',
      [authUser.id]
    )

    if (profileResult.rows.length === 0) {
      await query(
        'INSERT INTO profiles (id, full_name, role, language) VALUES ($1, $2, $3, $4)',
        [authUser.id, authUser.email.split('@')[0], authUser.role, 'en']
      )
      profileResult = await query(
        'SELECT id, full_name, role, language FROM profiles WHERE id = $1',
        [authUser.id]
      )
    }

    const user = profileResult.rows[0]
    const cookieStore = await cookies()
    cookieStore.set('sid', user.id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('role', user.role, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    await logAuditEvent({ userId: user.id, action: 'login', entityType: 'user', ipAddress: ip })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
