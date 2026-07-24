import { query } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { cookies } from 'next/headers'
import { dispatchEventToAllDevelopers } from '@/lib/webhook-dispatcher'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const adminId = await requireAdmin()
  if (adminId) {
    try {
      const result = await query('SELECT * FROM labs WHERE id = $1 AND deleted_at IS NULL', [params.id])
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json(result.rows[0])
    } catch {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  try {
    const result = await query('SELECT * FROM labs WHERE id = $1 AND is_published = true AND deleted_at IS NULL', [params.id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const lab = result.rows[0]

    if (lab.is_premium) {
      const cookieStore = await cookies()
      const sid = cookieStore.get('sid')?.value
      if (sid) {
        const subResult = await query(
          `SELECT id FROM subscriptions WHERE user_id = $1 AND status = 'active' AND tier IN ('premium', 'enterprise')`,
          [sid]
        )
        if (subResult.rows.length === 0) {
          const { html_threejs_code, ...labMetadata } = lab
          return NextResponse.json({ ...labMetadata, code_gated: true })
        }
      } else {
        const { html_threejs_code, ...labMetadata } = lab
        return NextResponse.json({ ...labMetadata, code_gated: true })
      }
    }

    return NextResponse.json(lab)
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
    if (!body.title || !body.subtopic_id || !body.subject) {
      return NextResponse.json({ error: 'Missing required fields: title, subtopic_id, subject' }, { status: 400 })
    }
    const result = await query(
      `UPDATE labs SET subtopic_id = $1, title = $2, title_sw = $3, description = $4, subject = $5,
       html_threejs_code = $6, is_published = $7, version = version + 1, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [body.subtopic_id, body.title, body.title_sw || '', body.description || '', body.subject,
       body.html_threejs_code || null, body.is_published, params.id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updatedLab = result.rows[0]
    dispatchEventToAllDevelopers('lab.updated', {
      id: updatedLab.id,
      title: updatedLab.title,
      subject: updatedLab.subject,
      is_published: updatedLab.is_published,
      version: updatedLab.version,
    }).catch(() => {})

    return NextResponse.json(updatedLab)
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
    const result = await query('UPDATE labs SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id', [params.id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
