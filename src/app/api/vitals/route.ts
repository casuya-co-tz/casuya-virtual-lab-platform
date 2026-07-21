import { NextResponse, NextRequest } from 'next/server'

interface VitalsPayload {
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
  pathname: string
  userAgent?: string
}

const vitalsBuffer: VitalsPayload[] = []
const MAX_BUFFER = 100

export async function POST(request: NextRequest) {
  try {
    const body: VitalsPayload = await request.json()

    vitalsBuffer.push(body)
    if (vitalsBuffer.length > MAX_BUFFER) {
      vitalsBuffer.shift()
    }

    if (body.lcp && body.lcp > 2500) {
      console.warn(`[VITALS] Slow LCP on ${body.pathname}: ${body.lcp}ms`)
    }
    if (body.cls && body.cls > 0.1) {
      console.warn(`[VITALS] High CLS on ${body.pathname}: ${body.cls}`)
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    collected: vitalsBuffer.length,
    recent: vitalsBuffer.slice(-10),
  })
}
