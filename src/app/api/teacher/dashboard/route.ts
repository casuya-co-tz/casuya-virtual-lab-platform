import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('sid')?.value
    
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify role
    const profileResult = await query('SELECT * FROM profiles WHERE id = $1', [userId])
    const profile = profileResult.rows[0]
    
    if (!profile || profile.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let students: any[] = []
    if (profile.school_id) {
      // Fetch students in this teacher's school
      const studentsResult = await query(
        "SELECT id, full_name FROM profiles WHERE school_id = $1 AND role = 'student'",
        [profile.school_id]
      )
      students = studentsResult.rows
    }

    const studentIds = students.map((s: any) => s.id)

    // Fetch lab progress for these students
    let labProgress: any[] = []
    if (studentIds.length > 0) {
      const lpResult = await query(
        `SELECT lp.*, l.title as "labs", p.full_name as "profiles"
         FROM lab_progress lp
         JOIN labs l ON lp.lab_id = l.id
         JOIN profiles p ON lp.student_id = p.id
         WHERE lp.student_id = ANY($1)
         ORDER BY lp.last_server_ts DESC NULLS LAST
         LIMIT 20`,
        [studentIds]
      )
      // Format to match the previous structure
      labProgress = lpResult.rows.map(row => ({
        ...row,
        labs: { title: row.labs },
        profiles: { full_name: row.profiles }
      }))
    }

    // Calculate stats
    const totalStudents = studentIds.length
    const completedLabs = labProgress.filter(lp => lp.status === 'completed')
    const avgScore = completedLabs.length > 0 
      ? Math.round(completedLabs.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedLabs.length)
      : 0

    return NextResponse.json({
      stats: {
        totalStudents,
        completedLabs: completedLabs.length,
        averageScore: avgScore
      },
      recentActivity: labProgress,
      students: students,
      teacherSchoolId: profile.school_id
    })
  } catch (err: any) {
    console.error('Teacher Dashboard Error:', err)
    return NextResponse.json({ error: 'Internal Server Error', details: err.message || err }, { status: 500 })
  }
}
