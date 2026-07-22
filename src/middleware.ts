import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { endpointRateLimiters } from '@/lib/rate-limiter'
import { getSessionUserFromCookie } from '@/lib/session-role'

const RATE_LIMIT_CONFIG: Record<string, string> = {
  '/api/v1/labs/[id]': '/api/v1/labs',
  '/api/v1/search': '/api/v1/search',
  '/api/v1/public': '/api/v1/search',
}

function generateNonce(): string {
  try {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return Math.random().toString(36).slice(2, 18)
  }
}

function addCspHeaders(response: NextResponse): NextResponse {
  const nonce = generateNonce()
  const isDev = process.env.NODE_ENV === 'development'
  const csp = isDev
    ? `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co ws: wss:; font-src 'self' data: https://fonts.gstatic.com https://use.typekit.net; frame-src 'self'; frame-ancestors 'self'; form-action 'self'; object-src 'none'`
    : `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; font-src 'self' data: https://fonts.gstatic.com https://use.typekit.net; frame-src 'self'; frame-ancestors 'self'; form-action 'self'; object-src 'none'`
  response.headers.set('Content-Security-Policy', csp)
  return response
}

async function getSessionUser(req: NextRequest) {
  return getSessionUserFromCookie(
    req.cookies.get('sid')?.value ?? null,
    req.cookies.get('role')?.value ?? null,
  )
}

export async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/api/v1')) {
      if (!pathname.startsWith('/api/v1/public')) {
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
          return NextResponse.json({ error: 'Missing or invalid API key' }, { status: 401 })
        }

        const token = authHeader.slice(7)
        const envKey = process.env.API_KEY || 'demo-key'
        if (token !== envKey) {
          return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
        }
      }

      const limiterKey = RATE_LIMIT_CONFIG[pathname] || pathname.split('/').slice(0, 3).join('/')
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

    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/favicon.svg' || pathname === '/manifest.json' || pathname === '/sw.js') {
      return NextResponse.next()
    }

    if (pathname.startsWith('/auth')) {
      const user = await getSessionUser(req)
      if (user) return NextResponse.redirect(new URL(user.role === 'admin' ? '/admin' : '/student', req.url))
      return addCspHeaders(NextResponse.next())
    }

    const isAdminPage = pathname.startsWith('/admin')
    const isStudentPage = pathname.startsWith('/student')
    const isDeveloperPage = pathname.startsWith('/developer')

    if (isAdminPage || isStudentPage || isDeveloperPage) {
      const user = await getSessionUser(req)
      if (!user) {
        return NextResponse.redirect(new URL('/auth', req.url))
      }

      if (isAdminPage && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/student', req.url))
      }

      if (isStudentPage && user.role !== 'student' && user.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }

      if (isDeveloperPage && !['admin', 'developer'].includes(user.role)) {
        return NextResponse.redirect(new URL('/student', req.url))
      }

      return addCspHeaders(NextResponse.next())
    }

    return addCspHeaders(NextResponse.next())
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg|sw.js|manifest.json).*)'],
}
