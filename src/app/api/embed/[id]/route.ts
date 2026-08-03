import { NextResponse, NextRequest } from 'next/server'
import { sanitizeLabCode } from '@/lib/lab-processor'
import { getSessionFromCookies } from '@/lib/auth-guard'
import { canAccessPremiumContent } from '@/lib/subscription-access'
import { getLab } from '@/lib/lab-manager'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, props: Props) {
  const params = await props.params;
  try {
    const { id } = params
    const lab = await getLab(id)

    if (!lab) {
      return new NextResponse('<h1>Lab not found</h1>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    if (!lab.html_code) {
      return new NextResponse('<h1>Lab unavailable</h1>', {
        status: 403,
        headers: { 'Content-Type': 'text/html' },
      })
    }

    if (lab.is_premium) {
      const session = await getSessionFromCookies()
      if (!session || !(await canAccessPremiumContent(session.id, session.role))) {
        return new NextResponse('<h1>Premium subscription required</h1>', {
          status: 403,
          headers: { 'Content-Type': 'text/html' },
        })
      }
    }

    const sanitized = sanitizeLabCode(lab.html_code)
    const escapedTitle = lab.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const wrapper = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle}</title>
  <style>body{margin:0;padding:0;overflow:hidden;font-family:system-ui,sans-serif}</style>
</head>
<body>${sanitized}
</body>
</html>`

    return new NextResponse(wrapper, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "frame-ancestors *",
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new NextResponse('<h1>Internal error</h1>', {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }
}
