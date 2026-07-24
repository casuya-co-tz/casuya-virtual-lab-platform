import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function POST(req: NextRequest) {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { class_code } = await req.json()
    if (!class_code) return NextResponse.json({ error: 'Class code required' }, { status: 400 })

    const classroom = await query(
      `SELECT id, name, subject, max_students FROM classrooms WHERE class_code = $1`,
      [class_code.toUpperCase()]
    )
    if (classroom.rows.length === 0) return NextResponse.json({ error: 'Invalid class code' }, { status: 404 })

    const count = await query(
      `SELECT COUNT(*) as cnt FROM classroom_enrollments WHERE classroom_id = $1`,
      [classroom.rows[0].id]
    )
    if (parseInt(count.rows[0].cnt) >= classroom.rows[0].max_students) {
      return NextResponse.json({ error: 'Classroom is full' }, { status: 403 })
    }

    const existing = await query(
      `SELECT id FROM classroom_enrollments WHERE classroom_id = $1 AND student_id = $2`,
      [classroom.rows[0].id, userId]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 409 })
    }

    const result = await query(
      `INSERT INTO classroom_enrollments (classroom_id, student_id) VALUES ($1, $2) RETURNING id, enrolled_at`,
      [classroom.rows[0].id, userId]
    )

    return NextResponse.json({ enrollment: result.rows[0], classroom: classroom.rows[0] }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
