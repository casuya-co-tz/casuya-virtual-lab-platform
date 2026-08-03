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
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

    if (lab.is_premium) {
      const session = await getSessionFromCookies()
      if (!session || !(await canAccessPremiumContent(session.id, session.role))) {
        return NextResponse.json({ error: 'Subscription required', upgradeUrl: '/pricing' }, { status: 403 })
      }
    }

    if (!lab.html_code) {
      return NextResponse.json({ error: 'No code available' }, { status: 404 })
    }

    const sanitized = sanitizeLabCode(lab.html_code)

    return new NextResponse(sanitized, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
