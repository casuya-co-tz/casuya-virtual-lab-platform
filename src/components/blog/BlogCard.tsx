'use client'
import { useLanguage } from '@/hooks/useLanguage'

interface BlogCardProps {
  title: string
  title_sw: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  tags: string[]
  published_at: string
}

export function BlogCard({ title, title_sw, slug, excerpt, featured_image, tags, published_at }: BlogCardProps) {
  const { lang } = useLanguage()
  const date = new Date(published_at).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <a href={`/blog/${slug}`} className="block bg-bg-primary border border-border hover:border-accent-blue/50 transition-all group">
      {featured_image && (
        <div className="h-40 overflow-hidden">
          <img src={featured_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-4">
        <p className="text-[11px] text-text-secondary mb-1">{date}</p>
        <h3 className="text-[14px] font-bold text-text-primary group-hover:text-accent-blue transition-colors mb-1">
          {lang === 'sw' ? title_sw : title}
        </h3>
        {excerpt && <p className="text-[12px] text-text-secondary line-clamp-2">{excerpt}</p>}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map(tag => (
              <span key={tag} className="text-[9px] uppercase tracking-wider bg-bg-tertiary text-text-secondary px-1.5 py-0.5">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
