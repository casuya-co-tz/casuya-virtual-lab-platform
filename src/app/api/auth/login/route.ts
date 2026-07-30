import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { logAuditEvent } from '@/lib/audit-logger'
import { loginLimiter } from '@/lib/rate-limiter'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    const rateResult = loginLimiter.check(ip, 'login')
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again in 1 minute.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const userResult = await query(
      'SELECT id, email, encrypted_password, role FROM auth.users WHERE email = $1',
      [email]
    )
    if (userResult.rows.length === 0) {
      await logAuditEvent({ userId: null, action: 'login_failed', entityType: 'user', ipAddress: ip, newValues: { email } })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const authUser = userResult.rows[0]
    const valid = await bcrypt.compare(password, authUser.encrypted_password)
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

    const sessionId = crypto.randomUUID()
    await query(
      `INSERT INTO user_sessions (id, user_id, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
      [sessionId, user.id, ip, req.headers.get('user-agent') || null]
    )

    const isProd = process.env.NODE_ENV === 'production'
    const cookieStore = await cookies()
    cookieStore.set('sid', sessionId, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('role', user.role, {
      httpOnly: true,
      secure: isProd,
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
