import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const [students, labs] = await Promise.all([
      query("SELECT COUNT(*) FROM profiles WHERE role = 'student'"),
      query("SELECT COUNT(*) FROM labs WHERE is_published = true"),
    ])

    return NextResponse.json({
      total_students: parseInt(students.rows[0].count),
      total_labs: parseInt(labs.rows[0].count),
      uptime: '99.97%',
    })
  } catch {
    return NextResponse.json({ total_students: 0, total_labs: 0, uptime: '99.97%' })
  }
}
