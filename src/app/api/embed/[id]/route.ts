import { query } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { sanitizeLabCode } from '@/lib/lab-processor'

interface Props {
  params: { id: string }
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = params
    const result = await query(
      `SELECT l.title, l.html_threejs_code, l.is_published, l.subject,
              s.name AS subject_name
       FROM labs l
       LEFT JOIN subjects s ON LOWER(s.name) = LOWER(l.subject)
       WHERE l.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return new NextResponse('<h1>Lab not found</h1>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    const lab = result.rows[0]

    if (!lab.is_published || !lab.html_threejs_code) {
      return new NextResponse('<h1>Lab unavailable</h1>', {
        status: 403,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    const sanitized = sanitizeLabCode(lab.html_threejs_code)
    const escapedTitle = lab.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const wrapper = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <style>body{margin:0;padding:0;overflow:hidden;font-family:system-ui,sans-serif}</style>
</head>
<body>${sanitized}</body>
</html>`

    return new NextResponse(wrapper, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOW-FROM',
        'Content-Security-Policy': "frame-ancestors *",
      },
    })
  } catch {
    return new NextResponse('<h1>Internal error</h1>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }
}
