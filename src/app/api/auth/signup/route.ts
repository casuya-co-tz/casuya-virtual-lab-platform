import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { logAuditEvent } from '@/lib/audit-logger'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const requestedRole = body.role === 'teacher' ? 'teacher' : 'student'
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await query('SELECT id FROM auth.users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashed = bcrypt.hashSync(password, 10)
    const userResult = await query(
      `INSERT INTO auth.users (email, encrypted_password, role)
       VALUES ($1, $2, $3) RETURNING id`,
      [email, hashed, requestedRole]
    )

    const userId = userResult.rows[0].id
    const finalName = fullName || email.split('@')[0]
    
    let schoolIdToAssign = null;

    if (requestedRole === 'teacher') {
      const schoolName = `${finalName}'s School`;
      const schoolResult = await query(
        'INSERT INTO schools (name, billing_contact_email) VALUES ($1, $2) RETURNING id',
        [schoolName, email]
      )
      schoolIdToAssign = schoolResult.rows[0].id;
    } else if (requestedRole === 'student' && body.schoolId) {
      // Validate the provided schoolId exists
      const checkSchool = await query('SELECT id FROM schools WHERE id = $1', [body.schoolId])
      if (checkSchool.rows.length > 0) {
        schoolIdToAssign = body.schoolId
      }
    }

    await query(
      'INSERT INTO profiles (id, full_name, role, language, school_id) VALUES ($1, $2, $3, $4, $5)',
      [userId, finalName, requestedRole, 'en', schoolIdToAssign]
    )

    const isProd = process.env.NODE_ENV === 'production'
    const cookieStore = await cookies()
    cookieStore.set('sid', userId, {
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

    await logAuditEvent({ userId, action: 'signup', entityType: 'user', ipAddress: ip, newValues: { email, role: requestedRole } })

    return NextResponse.json({ user: { id: userId, full_name: fullName, role: requestedRole } })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
