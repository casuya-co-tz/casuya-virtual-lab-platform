import { cookies } from 'next/headers'
import { query } from './db'

export async function requireAdmin() {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  if (!sid) return null

  try {
    const result = await query(
      "SELECT role FROM profiles WHERE id = $1",
      [sid]
    )
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return null
    }
    return sid
  } catch {
    return null
  }
}

export async function requireAuth() {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  if (!sid) return null

  try {
    const result = await query(
      "SELECT id FROM profiles WHERE id = $1",
      [sid]
    )
    if (result.rows.length === 0) return null
    return sid
  } catch {
    return null
  }
}
