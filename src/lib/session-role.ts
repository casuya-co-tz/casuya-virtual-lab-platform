export function getSessionUserFromCookie(sid: string | null, role: string | null) {
  if (!sid || !role) return null

  return {
    id: sid,
    role,
  }
}
