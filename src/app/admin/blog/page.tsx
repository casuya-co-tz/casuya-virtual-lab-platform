'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useRouter } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  title_sw: string
  slug: string
  excerpt: string | null
  is_published: boolean
  is_featured: boolean
  tags: string[]
  published_at: string | null
  created_at: string
  author_name: string | null
}

export default function AdminBlogPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    fetch(`/api/admin/blog?${params}`)
      .then(r => r.ok ? r.json() : { data: [], pagination: { totalPages: 1 } })
      .then(json => {
        setPosts(json.data)
        setTotalPages(json.pagination.totalPages)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, search])

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('blog.title', lang)}</h1>
        <Button variant="primary" onClick={() => router.push('/admin/blog/new')} className="w-full sm:w-auto">
          {t('blog.create', lang)}
        </Button>
      </div>

      <div className="mb-2">
        <input
          className="w-full sm:w-64 px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
          placeholder={t('common.search', lang)}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      {loading ? (
        <p className="text-text-secondary">{t('admin.loading', lang)}</p>
      ) : posts.length === 0 ? (
        <div className="bg-bg-primary border border-border p-2">
          <p className="text-[13px] text-text-secondary text-center py-4">{t('blog.noPosts', lang)}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map(post => (
            <div
              key={post.id}
              className="bg-bg-primary border border-border p-2 hover:cursor-pointer hover:border-accent-blue/50 transition-colors"
              onClick={() => router.push(`/admin/blog/${post.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold text-text-primary truncate">{post.title}</h3>
                  <p className="text-[11px] text-text-secondary">/{post.slug} {post.author_name ? `· ${post.author_name}` : ''}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {post.is_featured && <Badge variant="info">Featured</Badge>}
                  <Badge variant={post.is_published ? 'success' : 'neutral'}>
                    {post.is_published ? t('blog.published', lang) : t('blog.draft', lang)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
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
