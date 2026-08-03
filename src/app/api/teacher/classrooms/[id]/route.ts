import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const classroom = await query(
      `SELECT * FROM classrooms WHERE id = $1 AND teacher_id = $2`,
      [params.id, userId]
    )
    if (classroom.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const enrollments = await query(
      `SELECT ce.id as enrollment_id, ce.enrolled_at, p.id as student_id, p.full_name, p.language
       FROM classroom_enrollments ce JOIN profiles p ON p.id = ce.student_id
       WHERE ce.classroom_id = $1 ORDER BY ce.enrolled_at DESC`,
      [params.id]
    )

    return NextResponse.json({ ...classroom.rows[0], students: enrollments.rows })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await query(`DELETE FROM classrooms WHERE id = $1 AND teacher_id = $2`, [params.id, userId])
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
