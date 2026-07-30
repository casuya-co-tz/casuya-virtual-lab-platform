import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!token) {
      return NextResponse.json({ error: 'Reset token required' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const tokenResult = await query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [tokenHash]
    )
    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    const resetRow = tokenResult.rows[0]
    const hashed = bcrypt.hashSync(password, 12)

    await query('UPDATE auth.users SET encrypted_password = $1 WHERE id = $2', [hashed, resetRow.user_id])
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetRow.id])
    await query(
      `UPDATE user_sessions SET revoked_at = NOW()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [resetRow.user_id]
    )

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
