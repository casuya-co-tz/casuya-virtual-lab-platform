import { query } from './db'
import { sanitizeLabCode, computeSecurityScore } from './lab-processor'

export async function getLabs(filters?: { subject?: string; published?: boolean }) {
  let sql = `
    SELECT l.*, s.name AS subject_name, st.title AS subtopic_title,
           t.title AS topic_title, p.full_name AS creator_name
    FROM labs l
    LEFT JOIN subjects s ON LOWER(s.name) = LOWER(l.subject)
    LEFT JOIN subtopics st ON st.id = l.subtopic_id
    LEFT JOIN topics t ON t.id = st.topic_id
    LEFT JOIN profiles p ON p.id = l.created_by
  `
  const conditions: string[] = []
  const params: unknown[] = []

  if (filters?.subject) {
    params.push(filters.subject)
    conditions.push(`LOWER(l.subject) = $${params.length}`)
  }
  if (filters?.published !== undefined) {
    params.push(filters.published)
    conditions.push(`l.is_published = $${params.length}`)
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`
  }
  sql += ' ORDER BY l.created_at DESC'

  const result = await query(sql, params)
  return result.rows
}

export async function getLabById(id: string) {
  const result = await query(
    `SELECT l.*, s.name AS subject_name, st.title AS subtopic_title,
            t.title AS topic_title, p.full_name AS creator_name
     FROM labs l
     LEFT JOIN subjects s ON LOWER(s.name) = LOWER(l.subject)
     LEFT JOIN subtopics st ON st.id = l.subtopic_id
     LEFT JOIN topics t ON t.id = st.topic_id
     LEFT JOIN profiles p ON p.id = l.created_by
     WHERE l.id = $1`,
    [id]
  )
  return result.rows[0] || null
}

export async function createLab(data: {
  title: string
  title_sw: string
  description?: string
  subject: string
  subtopic_id: string
  html_threejs_code?: string
  is_published?: boolean
  created_by: string
}) {
  const code = data.html_threejs_code || ''
  const securityScore = computeSecurityScore(code)
  const sanitized = sanitizeLabCode(code)

  const result = await query(
    `INSERT INTO labs (title, title_sw, description, subject, subtopic_id, html_threejs_code, is_published, security_score, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [data.title, data.title_sw, data.description || null, data.subject, data.subtopic_id, sanitized, data.is_published || false, securityScore, data.created_by]
  )
  return result.rows[0]
}

export async function updateLab(id: string, data: Record<string, unknown>) {
  const allowed = ['title', 'title_sw', 'description', 'subject', 'subtopic_id', 'html_threejs_code', 'is_published']
  const sets: string[] = []
  const params: unknown[] = []

  for (const key of allowed) {
    if (key in data) {
      params.push(key === 'html_threejs_code' ? sanitizeLabCode(String(data[key])) : data[key])
      sets.push(`${key} = $${params.length}`)
    }
  }

  if (sets.length === 0) return null

  if (data.html_threejs_code) {
    params.push(computeSecurityScore(String(data.html_threejs_code)))
    sets.push(`security_score = $${params.length}`)
  }

  params.push(id)
  const result = await query(
    `UPDATE labs SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  )
  return result.rows[0] || null
}

export async function deleteLab(id: string) {
  await query('DELETE FROM labs WHERE id = $1', [id])
}
