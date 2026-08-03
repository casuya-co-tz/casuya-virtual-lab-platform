import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getDeveloperId } from '@/lib/developer-auth'

export async function GET(req: NextRequest) {
  const developerId = await getDeveloperId()
  if (!developerId) return NextResponse.json({ error: 'Developer access required' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') || 'json'
  const period = searchParams.get('period') || '30d'
  const days = period === '90d' ? 90 : period === '7d' ? 7 : 30

  try {
    const credentials = await query(`SELECT id FROM api_credentials WHERE developer_id = $1`, [developerId])
    const credIds = credentials.rows.map((c: { id: string }) => c.id)
    if (credIds.length === 0) {
      if (format === 'csv') return new NextResponse('No data', { headers: { 'Content-Type': 'text/csv' } })
      return NextResponse.json({ data: [] })
    }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const result = await query(
      `SELECT DATE(accessed_at) as date, endpoint, status_code, COUNT(*) as request_count
       FROM api_usage WHERE credential_id = ANY($1) AND accessed_at >= $2
       GROUP BY DATE(accessed_at), endpoint, status_code ORDER BY date, request_count DESC`,
      [credIds, since]
    )

    if (format === 'csv') {
      const escapeCsv = (value: unknown): string => {
        const str = String(value ?? '')
        if (/[",\r\n]/.test(str) || /^[=+\-@]/.test(str)) return `"${str.replace(/"/g, '""')}"`
        return str
      }
      const fmtDate = (value: unknown): string =>
        value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? '')

      const header = 'Date,Endpoint,Status Code,Request Count\n'
      const rows = result.rows.map((r: Record<string, unknown>) =>
        [fmtDate(r.date), escapeCsv(r.endpoint), escapeCsv(r.status_code), escapeCsv(r.request_count)].join(',')
      ).join('\n')
      return new NextResponse(header + rows, {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="api-usage-${period}.csv"` },
      })
    }

    return NextResponse.json({ data: result.rows, period, generated_at: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
