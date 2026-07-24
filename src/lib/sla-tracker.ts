import { query } from './db'

export async function logIncident(title: string, description: string, severity: 'minor' | 'major' | 'critical') {
  return query(
    `INSERT INTO incidents (title, description, severity, status) VALUES ($1, $2, $3, 'investigating') RETURNING id`,
    [title, description, severity]
  )
}

export async function updateIncidentStatus(incidentId: string, status: string, updateNote: string) {
  const incident = await query(`SELECT updates FROM incidents WHERE id = $1`, [incidentId])
  if (incident.rows.length === 0) return null

  const existing = incident.rows[0].updates || []
  const newUpdates = [...existing, { status, note: updateNote, timestamp: new Date().toISOString() }]

  const resolvedAt = status === 'resolved' ? 'NOW()' : 'NULL'
  return query(
    `UPDATE incidents SET status = $1, updates = $2, resolved_at = ${resolvedAt} WHERE id = $3`,
    [status, JSON.stringify(newUpdates), incidentId]
  )
}

export async function getSystemUptime(): Promise<{ uptimePercent: number; totalIncidents: number; unresolvedIncidents: number }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const uptimeLogs = await query(
    `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'down') as down_count
     FROM uptime_logs WHERE checked_at >= $1`,
    [thirtyDaysAgo]
  )

  const total = parseInt(uptimeLogs.rows[0]?.total || '0')
  const downCount = parseInt(uptimeLogs.rows[0]?.down_count || '0')
  const uptimePercent = total > 0 ? ((total - downCount) / total) * 100 : 100

  const incidentCount = await query(
    `SELECT COUNT(*) as total FROM incidents WHERE created_at >= $1`,
    [thirtyDaysAgo]
  )

  const unresolved = await query(
    `SELECT COUNT(*) as total FROM incidents WHERE status != 'resolved'`
  )

  return {
    uptimePercent: Math.round(uptimePercent * 100) / 100,
    totalIncidents: parseInt(incidentCount.rows[0]?.total || '0'),
    unresolvedIncidents: parseInt(unresolved.rows[0]?.total || '0'),
  }
}
