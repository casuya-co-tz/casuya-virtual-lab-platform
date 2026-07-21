import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = cookies()
  cookieStore.set('sid', '', { httpOnly: true, path: '/', maxAge: 0 })
  return NextResponse.json({ ok: true })
}
