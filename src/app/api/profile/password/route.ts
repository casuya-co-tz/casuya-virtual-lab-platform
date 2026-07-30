import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserIdFromSession } from '@/lib/auth-guard'

export async function PUT(req: Request) {
  const userId = await getUserIdFromSession()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'New password must differ from current' }, { status: 400 })
    }

    const userResult = await query(
      'SELECT encrypted_password FROM auth.users WHERE id = $1',
      [userId]
    )
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const valid = bcrypt.compareSync(currentPassword, userResult.rows[0].encrypted_password)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
    }

    const hashed = bcrypt.hashSync(newPassword, 12)
    await query(
      'UPDATE auth.users SET encrypted_password = $1 WHERE id = $2',
      [hashed, userId]
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
