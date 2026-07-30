import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { getLabs, getLab, createLab } from '@/lib/lab-manager'
import { dispatchEventToAllDevelopers } from '@/lib/webhook-dispatcher'
import { query } from '@/lib/db'
import { maybeSync } from '@/lib/lab-sync'

export async function GET(req: Request) {
  const adminId = await requireAdmin()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const subject = searchParams.get('subject') || undefined

  maybeSync()

  if (adminId) {
    try {
      const result = await getLabs({ subject, page, limit })
      if (result.data && Array.isArray(result.data)) {
        try {
          const ids = result.data.map((lab: any) => lab.id)
          if (ids.length > 0) {
            const placeholders = ids.map((_: any, i: number) => `$${i + 1}`).join(',')
            const localRows = await query(
              `SELECT id, is_published, is_premium FROM labs WHERE id IN (${placeholders})`,
              ids
            )
            const localMap: Record<string, any> = {}
            for (const row of localRows.rows) {
              localMap[row.id] = { is_published: row.is_published, is_premium: row.is_premium }
            }
            for (const lab of result.data) {
              if (localMap[lab.id]) {
                lab.is_published = localMap[lab.id].is_published
                lab.is_premium = localMap[lab.id].is_premium
              } else {
                lab.is_published = true
              }
            }
          }
        } catch {}
      }
      return NextResponse.json(result)
    } catch (err) {
      console.error('Failed to fetch labs (admin):', err)
      return NextResponse.json({ error: 'Failed to fetch labs' }, { status: 500 })
    }
  }

  try {
    const result = await getLabs({ subject, page, limit })
    if (result.data && Array.isArray(result.data)) {
      try {
        const ids = result.data.map((lab: any) => lab.id)
        if (ids.length > 0) {
          const placeholders = ids.map((_: any, i: number) => `$${i + 1}`).join(',')
          const localRows = await query(
            `SELECT id, is_published, is_premium FROM labs WHERE id IN (${placeholders})`,
            ids
          )
          const localMap: Record<string, any> = {}
          for (const row of localRows.rows) {
            localMap[row.id] = { is_published: row.is_published, is_premium: row.is_premium }
          }
          for (const lab of result.data) {
            if (localMap[lab.id]) {
              lab.is_published = localMap[lab.id].is_published
              lab.is_premium = localMap[lab.id].is_premium
            } else {
              lab.is_published = true
            }
          }
        }
      } catch {}
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error('Failed to fetch labs (public):', err)
    return NextResponse.json({ error: 'Failed to fetch labs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const userId = await requireAdmin()
  if (!userId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await req.json()
    if (!body.title || !body.subject || !body.html_code) {
      return NextResponse.json({ error: 'Missing required fields: title, subject, html_code' }, { status: 400 })
    }

    const lab = await createLab({
      title: body.title,
      title_sw: body.title_sw,
      subject: body.subject,
      description: body.description,
      description_sw: body.description_sw,
      html_code: body.html_code,
      subtopic_id: body.subtopic_id,
      is_premium: body.is_premium,
      scoring_config: body.scoring_config,
    })

    if (!lab) {
      return NextResponse.json({ error: 'Failed to create lab in Lab Content Service' }, { status: 500 })
    }

    try {
      await query(
        `INSERT INTO labs (id, title, title_sw, description, subject, html_threejs_code, subtopic_id, is_published, is_premium, version, created_at, updated_at, thumbnail)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, title_sw = EXCLUDED.title_sw,
           description = EXCLUDED.description, subject = EXCLUDED.subject,
           html_threejs_code = EXCLUDED.html_threejs_code, subtopic_id = EXCLUDED.subtopic_id,
           is_published = EXCLUDED.is_published, is_premium = EXCLUDED.is_premium,
           version = EXCLUDED.version, updated_at = NOW(), thumbnail = EXCLUDED.thumbnail`,
        [
          lab.id, lab.title, lab.title_sw, lab.description, lab.subject,
          lab.html_code, lab.subtopic_id || body.subtopic_id || null,
          lab.thumbnail || null, body.is_published !== undefined ? body.is_published : true, lab.is_premium, lab.current_version,
        ]
      )
    } catch (dbErr) {
      console.error('Failed to sync lab to local DB:', dbErr)
    }

    dispatchEventToAllDevelopers('lab.created', {
      id: lab.id,
      title: lab.title,
      subject: lab.subject,
      is_published: body.is_published !== undefined ? body.is_published : true,
      is_premium: lab.is_premium,
    }).catch(() => {})

    return NextResponse.json(lab, { status: 201 })
  } catch (err) {
    console.error('Failed to create lab:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
