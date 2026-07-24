'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'

interface Review {
  id: string
  rating: number
  review_text: string
  is_public: boolean
  helpful_count: number
  not_helpful_count: number
  created_at: string
  full_name: string
  user_role: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminReviewsPage() {
  const { lang } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('all')
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const limit = 20

  useEffect(() => {
    fetchReviews()
  }, [page, status])

  async function fetchReviews() {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status !== 'all') params.set('status', status)
    const r = await fetch(`/api/admin/reviews?${params}`)
    if (r.ok) {
      const json = await r.json()
      setReviews(json.data)
      setPagination(json.pagination)
    }
    setLoading(false)
  }

  async function toggleVisibility(id: string, current: boolean) {
    const r = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_public: !current }),
    })
    if (r.ok) {
      setReviews(reviews.map(rv => rv.id === id ? { ...rv, is_public: !current } : rv))
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review permanently?')) return
    const r = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    if (r.ok) {
      setReviews(reviews.filter(rv => rv.id !== id))
    }
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  const filterBtns = [
    { key: 'all', label: t('admin.all', lang) },
    { key: 'public', label: t('admin.reviewActive', lang) },
    { key: 'private', label: t('admin.reviewDeactivated', lang) },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('admin.reviews', lang)}</h1>
        <a href="/admin/reports" className="text-[13px] text-accent-blue underline">
          {t('admin.viewReports', lang)} →
        </a>
      </div>

      <div className="flex gap-2 mb-4">
        {filterBtns.map(btn => (
          <button
            key={btn.key}
            onClick={() => { setStatus(btn.key); setPage(1) }}
            className={`px-4 py-1.5 text-[12px] font-bold uppercase border ${
              status === btn.key
                ? 'bg-accent-blue text-white border-accent-blue'
                : 'bg-bg-secondary text-text-secondary border-border-strong hover:bg-bg-tertiary'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <Card>
        <Table headers={[t('admin.tableUser', lang), t('admin.reviewRating', lang), t('admin.reviewText', lang), t('admin.reviewStatus', lang), t('admin.tableDate', lang), t('admin.tableActions', lang)]}>
          {reviews.map(rv => (
            <Tr key={rv.id}>
              <Td>
                <div className="text-[14px]">{rv.full_name}</div>
                <div className="text-[11px] text-text-secondary uppercase">{rv.user_role}</div>
              </Td>
              <Td>
                <span className="text-accent-amber">{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</span>
              </Td>
              <Td className="max-w-[300px]">
                <p className="text-[13px] text-text-secondary truncate">{rv.review_text || '—'}</p>
              </Td>
              <Td>
                <Badge variant={rv.is_public ? 'success' : 'danger'}>
                  {rv.is_public ? t('admin.reviewActive', lang) : t('admin.reviewDeactivated', lang)}
                </Badge>
              </Td>
              <Td className="text-[13px]">{new Date(rv.created_at).toLocaleDateString()}</Td>
              <Td>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleVisibility(rv.id, rv.is_public)}
                    className="text-[12px] underline"
                  >
                    {rv.is_public ? t('admin.reviewDeactivate', lang) : t('admin.reviewActivate', lang)}
                  </button>
                  <button
                    onClick={() => deleteReview(rv.id)}
                    className="text-[12px] text-accent-red underline"
                  >
                    {t('admin.delete', lang)}
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
          {reviews.length === 0 && (
            <Tr>
              <Td colSpan={6} className="text-center text-text-secondary py-8">{t('admin.noData', lang)}</Td>
            </Tr>
          )}
        </Table>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 text-[13px] border border-border-strong disabled:opacity-40"
          >
            {t('admin.previous', lang)}
          </button>
          <span className="text-[13px] text-text-secondary">
            {t('admin.page', lang)} {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="px-4 py-2 text-[13px] border border-border-strong disabled:opacity-40"
          >
            {t('admin.next', lang)}
          </button>
        </div>
      )}
    </div>
  )
}
