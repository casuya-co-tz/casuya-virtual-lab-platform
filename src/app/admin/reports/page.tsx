'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'

interface Report {
  id: string
  review_id: string
  reason: string
  created_at: string
  resolved_at: string | null
  reporter_name: string
  review_text: string
  rating: number
}

export default function AdminReportsPage() {
  const { lang } = useLanguage()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    const r = await fetch('/api/admin/reports')
    if (r.ok) setReports(await r.json())
    setLoading(false)
  }

  async function resolveReport(id: string) {
    const r = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (r.ok) {
      setReports(reports.map(rp => rp.id === id ? { ...rp, resolved_at: new Date().toISOString() } : rp))
    }
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.viewReports', lang)}</h1>
      <Card>
        <Table headers={[t('admin.tableUser', lang), t('admin.reviewRating', lang), t('admin.reviewText', lang), 'Reason', t('admin.tableDate', lang), t('admin.reviewStatus', lang), t('admin.tableActions', lang)]}>
          {reports.map(rp => (
            <Tr key={rp.id}>
              <Td className="text-[13px]">{rp.reporter_name}</Td>
              <Td><span className="text-accent-amber">{'★'.repeat(rp.rating)}</span></Td>
              <Td className="max-w-[200px]"><p className="text-[13px] text-text-secondary truncate">{rp.review_text}</p></Td>
              <Td className="max-w-[200px]"><p className="text-[13px] text-text-secondary">{rp.reason}</p></Td>
              <Td className="text-[13px]">{new Date(rp.created_at).toLocaleDateString()}</Td>
              <Td>
                <Badge variant={rp.resolved_at ? 'success' : 'warning'}>
                  {rp.resolved_at ? 'Resolved' : 'Pending'}
                </Badge>
              </Td>
              <Td>
                {!rp.resolved_at && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resolveReport(rp.id)}
                      className="text-[12px] underline"
                    >
                      Resolve
                    </button>
                    <a
                      href={`/admin/reviews`}
                      className="text-[12px] text-accent-blue underline"
                    >
                      Manage Review
                    </a>
                  </div>
                )}
              </Td>
            </Tr>
          ))}
          {reports.length === 0 && (
            <Tr>
              <Td colSpan={7} className="text-center text-text-secondary py-8">{t('admin.noData', lang)}</Td>
            </Tr>
          )}
        </Table>
      </Card>
    </div>
  )
}
