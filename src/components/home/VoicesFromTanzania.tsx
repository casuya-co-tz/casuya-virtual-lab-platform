'use client'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'

interface Review {
  id: string
  rating: number
  review_text: string
  profiles: {
    full_name: string
    role: string
  }
}

export function VoicesFromTanzania() {
  const { lang } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  useEffect(() => {
    fetch('/api/profile').then(r => r.ok ? r.json() : null).then(data => setUser(data))
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    const r = await fetch('/api/reviews')
    if (r.ok) setReviews(await r.json())
  }

  const submitReview = async () => {
    if (!reviewText.trim()) return
    setIsSubmitting(true)
    const r = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, review_text: reviewText })
    })
    setIsSubmitting(false)
    if (r.ok) {
      setReviewText('')
      fetchReviews()
    } else {
      alert('Failed to submit review')
    }
  }

  const hardcodedVoices = [
    {
      text: t('home.voice1.text', lang),
      author: t('home.voice1.author', lang),
      avatar: "👩🏾‍🎓"
    },
    {
      text: t('home.voice2.text', lang),
      author: t('home.voice2.author', lang),
      avatar: "👨🏾‍🏫"
    }
  ]

  return (
    <section className="px-6 py-24 bg-bg-primary border-b border-border-default">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(28px,5vw,40px)] font-extrabold text-text-primary text-center tracking-tight mb-16">
          {t('home.voicesTitle', lang)}
        </h2>

        {/* Hardcoded Highlighted Voices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {hardcodedVoices.map((v, i) => (
            <div key={i} className="flex flex-col p-8 bg-bg-secondary shadow-sm border border-border-default relative overflow-hidden">
              <div className="absolute top-4 right-6 text-[48px] opacity-10">"</div>
              <div className="text-[40px] mb-4">{v.avatar}</div>
              <p className="text-[16px] italic text-text-primary mb-6 relative z-10 leading-relaxed">"{v.text}"</p>
              <p className="text-[14px] font-bold text-accent-blue mt-auto">— {v.author}</p>
            </div>
          ))}
        </div>

        {/* Dynamic User Reviews */}
        {reviews.length > 0 && (
          <div className="space-y-6 mb-16">
            <h3 className="text-[20px] font-bold text-text-primary text-center mb-8">{t('home.recentReviews', lang)}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reviews.map(r => (
                <div key={r.id} className="p-6 bg-bg-tertiary">
                  <div className="flex gap-1 mb-2 text-accent-amber">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <p className="text-[14px] text-text-secondary italic mb-4">"{r.review_text}"</p>
                  <p className="text-[12px] font-bold text-text-primary">— {r.profiles?.full_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Submission Form */}
        {user ? (
          <div className="bg-bg-secondary p-8 border border-border-default">
            <h3 className="text-[18px] font-bold text-text-primary mb-4">{t('home.leaveReview', lang)}</h3>
            <div className="flex gap-2 mb-4 text-[24px] cursor-pointer text-accent-amber">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} onClick={() => setRating(i + 1)}>
                  {i < rating ? '★' : '☆'}
                </span>
              ))}
            </div>
            <textarea 
              className="w-full bg-bg-primary border border-border-strong p-4 text-[14px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue resize-none mb-4"
              rows={3}
              placeholder={t('home.reviewPlaceholder', lang)}
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
            />
            <Button variant="primary" loading={isSubmitting} onClick={submitReview}>
              {t('home.submitReview', lang)}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-bg-secondary border border-border-default">
            <p className="text-[14px] text-text-secondary mb-4">{t('home.loginToReview', lang)}</p>
            <Button variant="secondary" onClick={() => window.location.href = '/auth'}>{t('home.loginBtn', lang)}</Button>
          </div>
        )}
      </div>
    </section>
  )
}
