import { cookies } from 'next/headers'
import { resolveSessionUser, type SessionUser } from './session'

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  if (!sid) return null
  return resolveSessionUser(sid)
}

export async function getUserIdFromSession(): Promise<string | null> {
  const session = await getSessionFromCookies()
  return session?.id ?? null
}

export async function getRoleIdFromSession(): Promise<string | null> {
  const session = await getSessionFromCookies()
  return session?.role ?? null
}

export async function requireAdmin(): Promise<string | null> {
  const session = await getSessionFromCookies()
  if (!session || session.role !== 'admin') return null
  return session.id
}

export async function requireTeacher(): Promise<string | null> {
  const session = await getSessionFromCookies()
  if (!session || session.role !== 'teacher') return null
  return session.id
}

export async function requireTeacherOrAdmin(): Promise<string | null> {
  const session = await getSessionFromCookies()
  if (!session || (session.role !== 'teacher' && session.role !== 'admin')) return null
  return session.id
}

export async function requireAuth(): Promise<string | null> {
  const session = await getSessionFromCookies()
  return session?.id ?? null
}

export async function requireStudentOrAdmin(): Promise<string | null> {
  const session = await getSessionFromCookies()
  if (!session || (session.role !== 'student' && session.role !== 'admin')) return null
  return session.id
}
