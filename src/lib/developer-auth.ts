import { query } from '@/lib/db'
import { cookies } from 'next/headers'

export async function getDeveloperId(): Promise<string | null> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  if (!sid) return null

  try {
    const sessionResult = await query(
      `SELECT s.user_id
       FROM user_sessions s
       JOIN profiles p ON p.id = s.user_id
       JOIN developer_profiles dp ON dp.id = s.user_id
       WHERE s.id = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW()
         AND p.role IN ('developer', 'admin')`,
      [sid]
    )
    if (sessionResult.rows.length > 0) {
      return sessionResult.rows[0].user_id
    }

    return null
  } catch {
    return null
  }
}
