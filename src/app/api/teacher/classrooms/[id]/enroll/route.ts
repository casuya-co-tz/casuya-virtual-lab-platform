import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const classroom = await query(
      `SELECT id, max_students FROM classrooms WHERE id = $1 AND teacher_id = $2`,
      [params.id, userId]
    )
    if (classroom.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { student_email } = await req.json()
    if (!student_email) return NextResponse.json({ error: 'Student email required' }, { status: 400 })

    const student = await query(
      `SELECT p.id FROM profiles p
       JOIN auth.users u ON u.id = p.id
       WHERE u.email = $1 AND p.role = 'student'`,
      [String(student_email).trim().toLowerCase()]
    )
    if (student.rows.length === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const studentId = student.rows[0].id

    const count = await query(
      `SELECT COUNT(*) as cnt FROM classroom_enrollments WHERE classroom_id = $1`,
      [params.id]
    )
    if (parseInt(count.rows[0].cnt) >= classroom.rows[0].max_students) {
      return NextResponse.json({ error: 'Classroom is full' }, { status: 403 })
    }

    const existing = await query(
      `SELECT id FROM classroom_enrollments WHERE classroom_id = $1 AND student_id = $2`,
      [params.id, studentId]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Student already enrolled' }, { status: 409 })
    }

    const result = await query(
      `INSERT INTO classroom_enrollments (classroom_id, student_id) VALUES ($1, $2) RETURNING id, enrolled_at`,
      [params.id, studentId]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const classroom = await query(
      `SELECT id FROM classrooms WHERE id = $1 AND teacher_id = $2`,
      [params.id, userId]
    )
    if (classroom.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { student_id } = await req.json()
    if (!student_id) return NextResponse.json({ error: 'student_id required' }, { status: 400 })

    const result = await query(
      `DELETE FROM classroom_enrollments WHERE classroom_id = $1 AND student_id = $2 RETURNING id`,
      [params.id, student_id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    return NextResponse.json({ removed: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
