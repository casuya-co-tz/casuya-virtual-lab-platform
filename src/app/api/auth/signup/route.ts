import { query, transaction } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { logAuditEvent } from '@/lib/audit-logger'
import { signupLimiter } from '@/lib/rate-limiter'
import { getClientIp } from '@/lib/client-ip'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const requestedRole = ['student', 'developer'].includes(body.role) ? body.role : 'student'
    const ip = getClientIp(req.headers.get('x-forwarded-for'))

    const rateCheck = signupLimiter.check(ip, '/api/auth/signup')
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many signup attempts. Try again later.' }, { status: 429 })
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const finalName = fullName || email.split('@')[0]

    const signupResult = await transaction(async (q) => {
      const existing = await q('SELECT id FROM auth.users WHERE email = $1', [email])
      if (existing.rows.length > 0) {
        throw Object.assign(new Error('Email already registered'), { code: 'EMAIL_EXISTS' })
      }

      const userResult = await q(
        `INSERT INTO auth.users (email, encrypted_password, role)
         VALUES ($1, $2, $3) RETURNING id`,
        [email, hashed, requestedRole]
      )

      const newUserId = userResult.rows[0].id as string
      let schoolIdToAssign: string | null = null

      if (requestedRole === 'developer') {
        await q(
          `INSERT INTO developer_profiles (id, company_or_school, plan_id)
           VALUES ($1, $2, (SELECT id FROM pricing_plans WHERE slug = 'dev_free' LIMIT 1))`,
          [newUserId, `${finalName}'s Projects`]
        )
      } else if (requestedRole === 'student' && body.schoolId) {
        const checkSchool = await q('SELECT id FROM schools WHERE id = $1', [body.schoolId])
        if (checkSchool.rows.length > 0) {
          schoolIdToAssign = body.schoolId
        }
      }

      await q(
        'INSERT INTO profiles (id, full_name, role, language, school_id) VALUES ($1, $2, $3, $4, $5)',
        [newUserId, finalName, requestedRole, 'en', schoolIdToAssign]
      )

      const newSessionId = crypto.randomUUID()
      await q(
        `INSERT INTO user_sessions (id, user_id, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
        [newSessionId, newUserId, ip, req.headers.get('user-agent') || null]
      )

      return { userId: newUserId, sessionId: newSessionId }
    })

    const isProd = process.env.NODE_ENV === 'production'
    const cookieStore = await cookies()
    cookieStore.set('sid', signupResult.sessionId, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('role', requestedRole, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    await logAuditEvent({
      userId: signupResult.userId,
      action: 'signup',
      entityType: 'user',
      ipAddress: ip,
      newValues: { email, role: requestedRole },
    })

    return NextResponse.json({
      user: { id: signupResult.userId, full_name: finalName, role: requestedRole },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if ((err as { code?: string })?.code === 'EMAIL_EXISTS' || /duplicate key value violates unique constraint/i.test(message)) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
