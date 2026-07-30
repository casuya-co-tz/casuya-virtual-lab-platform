'use client'
import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/contexts/UserContext'

interface Review {
  id: string
  rating: number
  review_text: string
  is_public: boolean
  helpful_count: number
  not_helpful_count: number
  created_at: string
  updated_at: string
  has_active_subscription?: boolean
  profiles?: {
    full_name: string
    role: string
  }
}

export function VoicesFromTanzania() {
  const { lang } = useLanguage()
  const { user } = useUser()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editText, setEditText] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [reportingId, setReportingId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [userVotes, setUserVotes] = useState<Record<string, boolean | null>>({})

  const fetchReviews = useCallback(async () => {
    const r = await fetch(`/api/reviews?page=${page}&limit=5&sort=created_at&order=desc`)
    if (r.ok) {
      const json = await r.json()
      setReviews(json.data)
      setTotalPages(json.pagination.totalPages)
    }
  }, [page])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const submitReview = async () => {
    if (!reviewText.trim()) return
    setIsSubmitting(true)
    const r = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, review_text: reviewText, is_public: isPublic }),
    })
    setIsSubmitting(false)
    if (r.ok) {
      setReviewText('')
      setIsPublic(true)
      setPage(1)
      fetchReviews()
    }
  }

  const startEdit = (rv: Review) => {
    setEditingId(rv.id)
    setEditRating(rv.rating)
    setEditText(rv.review_text || '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditRating(5)
    setEditText('')
  }

  const saveEdit = async (id: string) => {
    const r = await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: editRating, review_text: editText }),
    })
    if (r.ok) {
      cancelEdit()
      fetchReviews()
    }
  }

  const deleteReview = async (id: string) => {
    const r = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    if (r.ok) {
      setReviews(reviews.filter(rv => rv.id !== id))
    }
  }

  const submitReport = async (id: string) => {
    if (!reportReason.trim()) return
    const r = await fetch(`/api/reviews/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reportReason }),
    })
    if (r.ok) {
      setReportingId(null)
      setReportReason('')
    }
  }

  const vote = async (id: string, helpful: boolean) => {
    const r = await fetch(`/api/reviews/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpful }),
    })
    if (r.ok) {
      const data = await r.json()
      setReviews(reviews.map(rv => rv.id === id ? { ...rv, helpful_count: data.helpful_count, not_helpful_count: data.not_helpful_count } : rv))
      setUserVotes(prev => ({ ...prev, [id]: userVotes[id] === helpful ? null : helpful }))
    }
  }

  const canEdit = (rv: Review) => {
    const elapsed = Date.now() - new Date(rv.created_at).getTime()
    return elapsed < 30 * 60 * 1000
  }

  return (
    <section className="px-4 sm:px-6 py-10 sm:py-20 lg:py-24 bg-bg-primary border-b border-border">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(22px,5vw,38px)] font-extrabold text-text-primary text-center tracking-tight mb-8 sm:mb-14">
          {t('home.voicesTitle', lang)}
        </h2>

        {/* Dynamic User Reviews */}
        {reviews.length > 0 && (
          <div className="space-y-5 mb-10 sm:mb-14">
            <h3 className="text-[17px] sm:text-[19px] font-bold text-text-primary text-center mb-6">{t('home.recentReviews', lang)}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r.id} className="p-4 sm:p-5 bg-bg-tertiary">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-0.5 text-accent-amber text-[14px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    {r.has_active_subscription && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-accent-blue/15 text-accent-blue px-1.5 py-0.5">Verified</span>
                    )}
                  </div>

                  {editingId === r.id ? (
                    <div className="space-y-2 mb-3">
                      <div className="flex gap-1 text-[20px] cursor-pointer text-accent-amber">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} onClick={() => setEditRating(i + 1)}>
                            {i < editRating ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <textarea
                        className="w-full bg-bg-primary border border-border-strong p-2 text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 resize-none"
                        rows={2}
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" className="!h-7 !px-3 !text-[11px]" onClick={() => saveEdit(r.id)}>Save</Button>
                        <Button variant="secondary" className="!h-7 !px-3 !text-[11px]" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[13px] text-text-secondary italic mb-3">&ldquo;{r.review_text}&rdquo;</p>
                      <p className="text-[11px] font-bold text-text-primary mb-2">— {r.profiles?.full_name} <span className="font-normal text-text-secondary">{new Date(r.created_at).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></p>
                    </>
                  )}

                  {/* Vote buttons */}
                  <div className="flex items-center gap-3 text-[11px] text-text-secondary mb-2">
                    <button onClick={() => vote(r.id, true)} className={`flex items-center gap-1 hover:text-accent-green transition-colors ${userVotes[r.id] === true ? 'text-accent-green' : ''}`}>
                      👍 {r.helpful_count}
                    </button>
                    <button onClick={() => vote(r.id, false)} className={`flex items-center gap-1 hover:text-accent-red transition-colors ${userVotes[r.id] === false ? 'text-accent-red' : ''}`}>
                      👎 {r.not_helpful_count}
                    </button>
                  </div>

                  {/* Owner actions */}
                  {user?.id && r.profiles && (
                    <div className="flex items-center gap-2 text-[10px]">
                      {canEdit(r) && !editingId && (
                        <button onClick={() => startEdit(r)} className="text-accent-blue underline">Edit</button>
                      )}
                      <button onClick={() => deleteReview(r.id)} className="text-accent-red underline">Delete</button>
                    </div>
                  )}

                  {/* Report */}
                  {user && (
                    <div className="mt-2">
                      {reportingId === r.id ? (
                        <div className="flex gap-1.5">
                          <input
                            className="flex-1 min-w-0 bg-bg-primary border border-border-strong p-1.5 text-[11px] text-text-primary focus:outline-none"
                            placeholder="Reason..."
                            value={reportReason}
                            onChange={e => setReportReason(e.target.value)}
                          />
                          <Button variant="secondary" className="!h-7 !px-2 !text-[10px] shrink-0" onClick={() => submitReport(r.id)}>Send</Button>
                          <button className="text-[10px] text-text-secondary underline shrink-0" onClick={() => { setReportingId(null); setReportReason('') }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setReportingId(r.id)} className="text-[10px] text-text-secondary underline">
                          Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-[12px] border border-border-strong disabled:opacity-40 transition-opacity"
                >
                  {t('admin.previous', lang)}
                </button>
                <span className="text-[12px] text-text-secondary">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-[12px] border border-border-strong disabled:opacity-40 transition-opacity"
                >
                  {t('admin.next', lang)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Review Submission Form */}
        {user ? (
          <div className="bg-bg-secondary p-5 sm:p-7 border border-border">
            <h3 className="text-[16px] sm:text-[18px] font-bold text-text-primary mb-3">{t('home.leaveReview', lang)}</h3>
            <div className="flex gap-1 mb-3 text-[22px] cursor-pointer text-accent-amber">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} onClick={() => setRating(i + 1)}>
                  {i < rating ? '★' : '☆'}
                </span>
              ))}
            </div>
            <textarea
              className="w-full bg-bg-primary border border-border-strong p-3 text-[13px] sm:text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue resize-none mb-3"
              rows={3}
              placeholder={t('home.reviewPlaceholder', lang)}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />
            <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                className="w-3.5 h-3.5 accent-accent-blue"
              />
              <span className="text-[12px] text-text-secondary">{t('home.showPublicly', lang)}</span>
            </label>
            <Button variant="primary" loading={isSubmitting} onClick={submitReview} className="!h-10 w-full sm:w-auto">
              {t('home.submitReview', lang)}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-bg-secondary border border-border text-center">
            <p className="text-[13px] text-text-secondary mb-3">{t('home.loginToReview', lang)}</p>
            <Button variant="secondary" className="!h-10 w-full sm:w-auto" onClick={() => window.location.href = '/auth'}>{t('home.loginBtn', lang)}</Button>
          </div>
        )}
      </div>
    </section>
  )
}
