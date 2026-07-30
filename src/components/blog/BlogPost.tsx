'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { t } from '@/lib/i18n'

interface PostData {
  title: string
  title_sw: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  tags: string[]
  published_at: string
  author_name: string | null
}

export function BlogPost({ slug }: { slug: string }) {
  const { lang } = useLanguage()
  const router = useRouter()
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setPost(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <p className="text-text-secondary text-center py-8">{t('common.loading', lang)}</p>

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">{t('error.notFound', lang)}</p>
        <Button variant="primary" onClick={() => router.push('/blog')}>{t('blog.backToBlog', lang)}</Button>
      </div>
    )
  }

  const date = new Date(post.published_at).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <article className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.push('/blog')} className="mb-4">
        &larr; {t('blog.backToBlog', lang)}
      </Button>

      {post.featured_image && (
        <div className="w-full h-48 sm:h-64 overflow-hidden mb-4">
          <img src={post.featured_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-[clamp(22px,5vw,36px)] font-extrabold text-text-primary mb-2">
        {lang === 'sw' ? post.title_sw : post.title}
      </h1>

      <div className="flex items-center gap-3 text-[12px] text-text-secondary mb-6">
        {post.author_name && <span>{post.author_name}</span>}
        <span>{date}</span>
      </div>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {post.tags.map(tag => (
            <span key={tag} className="text-[9px] uppercase tracking-wider bg-bg-tertiary text-text-secondary px-2 py-0.5">{tag}</span>
          ))}
        </div>
      )}

      <div className="prose prose-sm max-w-none text-text-primary whitespace-pre-wrap text-[14px] leading-relaxed">
        {post.content}
      </div>
    </article>
  )
}
