import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { transaction } from '@/lib/db'
import { recoveryLimiter } from '@/lib/rate-limiter'
import { getClientIp } from '@/lib/client-ip'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const ip = getClientIp(req.headers.get('x-forwarded-for'))

    const rateCheck = recoveryLimiter.check(ip, '/api/auth/recovery/reset')
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many reset attempts. Try again later.' }, { status: 429 })
    }

    if (!token) {
      return NextResponse.json({ error: 'Reset token required' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const hashed = await bcrypt.hash(password, 12)

    const result = await transaction(async (q) => {
      // Atomically claim the token so concurrent use of the same token is rejected.
      const tokenResult = await q(
        `UPDATE password_reset_tokens SET used_at = NOW()
         WHERE id = (
           SELECT id FROM password_reset_tokens
           WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
           ORDER BY created_at DESC LIMIT 1
         )
         RETURNING id, user_id`,
        [tokenHash]
      )
      if (tokenResult.rows.length === 0) {
        throw Object.assign(new Error('Invalid or expired reset token'), { code: 'TOKEN_INVALID' })
      }

      const resetRow = tokenResult.rows[0]
      await q('UPDATE auth.users SET encrypted_password = $1 WHERE id = $2', [hashed, resetRow.user_id])
      await q(
        `UPDATE user_sessions SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [resetRow.user_id]
      )

      return resetRow
    })

    return NextResponse.json({ message: 'Password updated successfully', user_id: result.user_id })
  } catch (err) {
    if ((err as { code?: string })?.code === 'TOKEN_INVALID') {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
