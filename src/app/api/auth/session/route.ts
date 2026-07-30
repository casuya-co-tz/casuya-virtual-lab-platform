import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { resolveSessionUser } from '@/lib/session'

export async function GET() {
  const cookieStore = await cookies()
  const sid = cookieStore.get('sid')?.value
  if (!sid) {
    return NextResponse.json({ user: null })
  }

  const session = await resolveSessionUser(sid)
  if (!session) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({ user: session })
}
