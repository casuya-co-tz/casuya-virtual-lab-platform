import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

export async function GET() {
  const userId = await requireAdmin()
  if (!userId) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  try {
    const [students, labs, published, progress, completed, avgScore] = await Promise.all([
      query("SELECT COUNT(*) FROM profiles WHERE role = 'student'"),
      query('SELECT COUNT(*) FROM labs'),
      query('SELECT COUNT(*) FROM labs WHERE is_published = true'),
      query('SELECT COUNT(*) FROM lab_progress'),
      query("SELECT COUNT(*) FROM lab_progress WHERE status = 'completed'"),
      query('SELECT COALESCE(AVG(score), 0) AS avg FROM lab_progress WHERE score > 0'),
    ])

    return NextResponse.json({
      total_students: parseInt(students.rows[0].count),
      total_labs: parseInt(labs.rows[0].count),
      published_labs: parseInt(published.rows[0].count),
      total_progress: parseInt(progress.rows[0].count),
      completed_labs: parseInt(completed.rows[0].count),
      avg_score: parseFloat(avgScore.rows[0].avg),
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
