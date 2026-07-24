import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth-guard'
import crypto from 'crypto'

export async function GET() {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await query(
      `SELECT c.id, c.name, c.class_code, c.subject, c.max_students, c.created_at,
        (SELECT COUNT(*) FROM classroom_enrollments WHERE classroom_id = c.id) as student_count
       FROM classrooms c WHERE c.teacher_id = $1 ORDER BY c.created_at DESC`,
      [userId]
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = await requireAuth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const roleCheck = await query(`SELECT role FROM profiles WHERE id = $1`, [userId])
  if (roleCheck.rows[0]?.role !== 'teacher' && roleCheck.rows[0]?.role !== 'admin') {
    return NextResponse.json({ error: 'Teacher access required' }, { status: 403 })
  }

  try {
    const { name, subject, max_students } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const classCode = crypto.randomBytes(3).toString('hex').toUpperCase()

    const profile = await query(`SELECT school_id FROM profiles WHERE id = $1`, [userId])

    const result = await query(
      `INSERT INTO classrooms (teacher_id, school_id, name, class_code, subject, max_students)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, class_code, subject, max_students, created_at`,
      [userId, profile.rows[0]?.school_id || null, name, classCode, subject || null, max_students || 40]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
