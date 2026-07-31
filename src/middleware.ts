import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { endpointRateLimiters } from '@/lib/rate-limiter'
import { isDeveloperKeyFormat, parseBearerToken } from '@/lib/api-key-format'
import type { SessionUser } from '@/lib/session'

const RATE_LIMIT_CONFIG: Record<string, string> = {
  '/api/v1/labs/[id]': '/api/v1/labs',
  '/api/v1/search': '/api/v1/search',
  '/api/v1/public': '/api/v1/search',
}

function addCspHeaders(response: NextResponse): NextResponse {
  const isDev = process.env.NODE_ENV === 'development'
  const cdn = 'https://cdn.jsdelivr.net'
  const csp = isDev
    ? `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ${cdn}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co ws: wss:; font-src 'self' data: https://fonts.gstatic.com https://use.typekit.net; frame-src 'self' blob:; frame-ancestors 'self'; form-action 'self'; object-src 'none'`
    : `default-src 'self'; script-src 'self' 'unsafe-inline' ${cdn}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co; font-src 'self' data: https://fonts.gstatic.com https://use.typekit.net; frame-src 'self' blob:; frame-ancestors 'self'; form-action 'self'; object-src 'none'`
  response.headers.set('Content-Security-Policy', csp)
  return response
}

async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const sid = req.cookies.get('sid')?.value
  if (!sid) return null

  try {
    const res = await fetch(new URL('/api/auth/session', req.url), {
      headers: { cookie: req.headers.get('cookie') || '' },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.user ?? null
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/api/v1')) {
      const isPublic = pathname.startsWith('/api/v1/public')
      if (!isPublic) {
        const token = parseBearerToken(req.headers.get('authorization'))
        if (!token || !isDeveloperKeyFormat(token)) {
          return NextResponse.json(
            {
              error: 'Missing or invalid API key',
              message: 'Use Authorization: Bearer <public_token>:<secret>',
            },
            { status: 401 }
          )
        }
      }

      const limiterKey = isPublic
        ? '/api/v1/public'
        : RATE_LIMIT_CONFIG[pathname] || pathname.split('/').slice(0, 3).join('/')
      const limiter = endpointRateLimiters[limiterKey as keyof typeof endpointRateLimiters] || endpointRateLimiters['/api/v1']
      if (limiter) {
        const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown'
        const result = limiter.check(ip, pathname)
        const response = NextResponse.next()
        response.headers.set('X-RateLimit-Limit', String(result.limit))
        response.headers.set('X-RateLimit-Remaining', String(result.remaining))
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.reset / 1000)))
        if (!result.allowed) {
          return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }
        return response
      }
    }

    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/favicon.svg' || pathname === '/manifest.json' || pathname === '/sw.js' || pathname.startsWith('/labs/')) {
      return NextResponse.next()
    }

    if (pathname.startsWith('/auth')) {
      return addCspHeaders(NextResponse.next())
    }

    const isAdminPage = pathname.startsWith('/admin')
    const isStudentPage = pathname.startsWith('/student')
    const isDeveloperPage = pathname.startsWith('/developer')
    const isTeacherPage = pathname.startsWith('/teacher')

    if (isAdminPage || isStudentPage || isDeveloperPage || isTeacherPage) {
      const user = await getSessionUser(req)
      if (!user) {
        return NextResponse.redirect(new URL('/auth', req.url))
      }

      if (isAdminPage && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/student', req.url))
      }

      if (isTeacherPage && user.role !== 'teacher' && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/student', req.url))
      }

      if (isStudentPage && user.role !== 'student' && user.role !== 'admin') {
        if (user.role === 'teacher') {
          return NextResponse.redirect(new URL('/teacher', req.url))
        }
        return NextResponse.redirect(new URL('/auth', req.url))
      }

      // developer page is accessible to any authenticated user

      return addCspHeaders(NextResponse.next())
    }

    return addCspHeaders(NextResponse.next())
  } catch {
    return NextResponse.redirect(new URL('/auth', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg|favicon.ico|sw.js|manifest.json|images/|js/|labs/).*)'],
}
