import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { recoveryLimiter } from '@/lib/rate-limiter'
import { getClientIp } from '@/lib/client-ip'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const ip = getClientIp(req.headers.get('x-forwarded-for'))

    const rateCheck = recoveryLimiter.check(ip, '/api/auth/recovery')
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many reset requests. Try again later.' }, { status: 429 })
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const userResult = await query('SELECT id FROM auth.users WHERE email = $1', [email])
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id
      const token = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

      await query(
        `UPDATE password_reset_tokens SET used_at = NOW()
         WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
      )
      await query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
        [userId, tokenHash]
      )

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetLink = `${baseUrl}/auth/recovery/reset?token=${token}`
      if (process.env.NODE_ENV === 'development') {
        console.info(`[dev] Password reset link: ${resetLink}`)
      } else if (!process.env.SMTP_HOST) {
        // No mail provider configured — the link is only reachable by an operator.
        console.warn(`[recovery] Reset link for ${email}: ${resetLink}`)
      }
    }

    return NextResponse.json({
      message: 'If an account exists for that email, password reset instructions have been sent.',
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
