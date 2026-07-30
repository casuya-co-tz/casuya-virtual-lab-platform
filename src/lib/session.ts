import { query } from './db'

export interface SessionUser {
  id: string
  role: string
}

export async function resolveSessionUser(sid: string): Promise<SessionUser | null> {
  try {
    const result = await query(
      `SELECT s.user_id, p.role
       FROM user_sessions s
       JOIN profiles p ON p.id = s.user_id
       WHERE s.id = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW()`,
      [sid]
    )
    if (result.rows.length === 0) return null
    return { id: result.rows[0].user_id, role: result.rows[0].role }
  } catch (err) {
    console.error('Session resolution failed:', err)
    return null
  }
}
