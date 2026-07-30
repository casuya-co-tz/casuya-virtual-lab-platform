import { getLabs, getLab } from './lab-manager'
import { query } from './db'

let lastSyncTime = 0
const SYNC_COOLDOWN_MS = 30000

export async function syncAllLabsToLocalDB() {
  const all = await getLabs({ limit: 500 }).catch(() => ({ data: [] }))
  if (!all.data || !Array.isArray(all.data)) return

  for (const lab of all.data) {
    try {
      const detail = await getLab(lab.id)
      if (!detail) continue
      await query(
        `INSERT INTO labs (id, title, title_sw, description, subject, html_threejs_code, subtopic_id, is_published, is_premium, version, created_at, updated_at, thumbnail)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, title_sw = EXCLUDED.title_sw,
           description = EXCLUDED.description, subject = EXCLUDED.subject,
           html_threejs_code = EXCLUDED.html_threejs_code, subtopic_id = EXCLUDED.subtopic_id,
           is_published = EXCLUDED.is_published, is_premium = EXCLUDED.is_premium,
           version = EXCLUDED.version, updated_at = EXCLUDED.updated_at, thumbnail = EXCLUDED.thumbnail`,
        [
          detail.id,
          detail.title,
          detail.title_sw || detail.title,
          detail.description,
          detail.subject,
          detail.html_code,
          detail.subtopic_id || null,
          true,
          detail.is_premium,
          detail.current_version,
          detail.updated_at || new Date().toISOString(),
          detail.updated_at || new Date().toISOString(),
          detail.thumbnail || null,
        ]
      )
    } catch (err) {
      console.error('Failed to sync lab:', lab.id, lab.title, err)
    }
  }
}

export function maybeSync() {
  const now = Date.now()
  if (now - lastSyncTime > SYNC_COOLDOWN_MS) {
    lastSyncTime = now
    syncAllLabsToLocalDB().catch(() => {})
  }
}