import { NextResponse } from 'next/server'
import { requireAdmin, getSessionFromCookies } from '@/lib/auth-guard'
import { canAccessPremiumContent } from '@/lib/subscription-access'
import { getLab, updateLab, deleteLab } from '@/lib/lab-manager'
import { dispatchEventToAllDevelopers } from '@/lib/webhook-dispatcher'
import { query } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await requireAdmin()

  async function fetchLocal() {
    return query(
      'SELECT id, title, title_sw, description, subject, html_threejs_code AS html_code, subtopic_id, is_published, is_premium, version AS current_version, updated_at FROM labs WHERE id = $1' + (adminId ? '' : ' AND is_published = true'),
      [params.id]
    )
  }

  try {
    if (adminId) {
      try {
        const lab = await getLab(params.id)
        if (lab) {
          let localOverrides: Record<string, unknown> = {}
          try {
            const local = await query(
              'SELECT is_published, is_premium, subtopic_id FROM labs WHERE id = $1',
              [params.id]
            )
            if (local.rows[0]) localOverrides = local.rows[0]
          } catch {}
          return NextResponse.json({ ...lab, ...localOverrides })
        }
      } catch {}
      const local = await fetchLocal()
      if (local.rows[0]) return NextResponse.json(local.rows[0])
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const lab = await getLab(params.id)
    if (lab) {
      if (lab.is_premium) {
        const session = await getSessionFromCookies()
        if (!session || !(await canAccessPremiumContent(session.id, session.role))) {
          const { html_code, scoring_config, ...labMetadata } = lab
          return NextResponse.json({ ...labMetadata, code_gated: true })
        }
      }
      return NextResponse.json(lab)
    }

    const local = await fetchLocal()
    if (local.rows[0]) return NextResponse.json(local.rows[0])
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireAdmin()
  if (!userId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await req.json()

    const { id: _id, created_at: _ca, updated_at: _ua, ...cleanBody } = body

    let lab
    try {
      lab = await updateLab(params.id, cleanBody)
    } catch {}

    if (!lab) {
      try {
        const existing = await query('SELECT id, version FROM labs WHERE id = $1', [params.id])
        if (existing.rows.length === 0) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }
        await query(
          `UPDATE labs SET
             title = $1, title_sw = $2, description = $3, subject = $4,
             html_threejs_code = $5, subtopic_id = $6, thumbnail = $7,
             is_published = $8, is_premium = $9, version = version + 1, updated_at = NOW()
           WHERE id = $10`,
          [
            body.title || null, body.title_sw || null,
            body.description || null, body.subject || null,
            body.html_code || null, body.subtopic_id || null,
            body.thumbnail || null,
            body.is_published !== undefined ? body.is_published : false,
            body.is_premium !== undefined ? body.is_premium : false,
            params.id,
          ]
        )
        return NextResponse.json({ id: params.id, saved: 'local' })
      } catch { return NextResponse.json({ error: 'Not found or update failed' }, { status: 404 }) }
    }

    try {
      await query(
        `UPDATE labs SET
           title = COALESCE($1, title), title_sw = COALESCE($2, title_sw),
           description = COALESCE($3, description), subject = COALESCE($4, subject),
           html_threejs_code = COALESCE($5, html_threejs_code), subtopic_id = COALESCE($6, subtopic_id),
           thumbnail = COALESCE($7, thumbnail), is_published = COALESCE($8, is_published), is_premium = COALESCE($9, is_premium),
           version = COALESCE($10, version), updated_at = NOW()
         WHERE id = $11`,
        [
          body.title || null, body.title_sw || null,
          body.description || null, body.subject || null,
          body.html_code || null, body.subtopic_id || null,
          body.thumbnail || null, body.is_published !== undefined ? body.is_published : null,
          body.is_premium !== undefined ? body.is_premium : null,
          lab.current_version, params.id,
        ]
      )
    } catch (dbErr) {
      console.error('Failed to sync lab update to local DB:', dbErr)
    }

    dispatchEventToAllDevelopers('lab.updated', {
      id: lab.id,
      title: lab.title,
      subject: lab.subject,
      is_published: body.is_published !== undefined ? body.is_published : true,
      is_premium: lab.is_premium,
      version: lab.current_version,
    }).catch(() => {})

    return NextResponse.json(lab)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await requireAdmin()
  if (!userId) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const deleted = await deleteLab(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    try {
      await query('DELETE FROM labs WHERE id = $1', [params.id])
    } catch (dbErr) {
      console.error('Failed to sync lab deletion to local DB:', dbErr)
    }
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
