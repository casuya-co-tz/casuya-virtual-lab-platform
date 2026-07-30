'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { BlogCard } from './BlogCard'

interface Post {
  id: string
  title: string
  title_sw: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  tags: string[]
  published_at: string
}

export function BlogList() {
  const { lang } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetch(`/api/blog?page=${page}&limit=9`)
      .then(r => r.ok ? r.json() : { data: [], pagination: { totalPages: 1 } })
      .then(json => {
        setPosts(json.data)
        setTotalPages(json.pagination.totalPages)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page])

  if (loading) return <p className="text-text-secondary text-center py-8">{t('common.loading', lang)}</p>

  if (posts.length === 0) {
    return <p className="text-text-secondary text-center py-8">{t('blog.noPosts', lang)}</p>
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(post => (
          <BlogCard key={post.id} {...post} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-[12px] border border-border-strong disabled:opacity-40">
            {t('admin.previous', lang)}
          </button>
          <span className="text-[12px] text-text-secondary">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-[12px] border border-border-strong disabled:opacity-40">
            {t('admin.next', lang)}
          </button>
        </div>
      )}
    </div>
  )
}
