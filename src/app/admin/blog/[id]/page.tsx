'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { useRouter, useParams } from 'next/navigation'

export default function EditBlogPostPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const [form, setForm] = useState({ title: '', title_sw: '', slug: '', content: '', excerpt: '', featured_image: '', tags: '' })
  const [isPublished, setIsPublished] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/blog/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setForm({ title: data.title, title_sw: data.title_sw, slug: data.slug, content: data.content, excerpt: data.excerpt || '', featured_image: data.featured_image || '', tags: (data.tags || []).join(', ') })
          setIsPublished(data.is_published)
          setIsFeatured(data.is_featured)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  async function handleSave(publish: boolean) {
    if (!form.title || !form.title_sw || !form.slug || !form.content) {
      setError('Title (EN & SW), Slug, and Content are required')
      return
    }
    setSaving(true)
    setError('')
    const r = await fetch(`/api/admin/blog/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        is_published: publish,
        is_featured: isFeatured,
        published_at: publish ? new Date().toISOString() : null,
      }),
    })
    setSaving(false)
    if (r.ok) {
      router.push('/admin/blog')
      router.refresh()
    } else {
      const data = await r.json()
      setError(data.error || 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post permanently?')) return
    const r = await fetch(`/api/admin/blog/${params.id}`, { method: 'DELETE' })
    if (r.ok) {
      router.push('/admin/blog')
      router.refresh()
    }
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('blog.editPost', lang)}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push('/admin/blog')}>{t('common.cancel', lang)}</Button>
          <Button variant="danger" onClick={handleDelete}>{t('admin.delete', lang)}</Button>
        </div>
      </div>

      {error && <p className="text-[12px] text-accent-red mb-2">{error}</p>}

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] uppercase tracking-[0.5px] text-text-secondary block mb-1">Title (EN) *</label>
            <input className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.5px] text-text-secondary block mb-1">Title (SW) *</label>
            <input className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={form.title_sw} onChange={e => setForm({ ...form, title_sw: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-[0.5px] text-text-secondary block mb-1">{t('blog.slug', lang)} *</label>
          <input className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-[0.5px] text-text-secondary block mb-1">{t('blog.excerpt', lang)}</label>
          <textarea className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue/50" rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-[0.5px] text-text-secondary block mb-1">{t('blog.content', lang)} * (Markdown)</label>
          <textarea className="w-full h-64 px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary font-mono resize-y focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] uppercase tracking-[0.5px] text-text-secondary block mb-1">{t('blog.featuredImage', lang)}</label>
            <input className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={form.featured_image} onChange={e => setForm({ ...form, featured_image: e.target.value })} />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.5px] text-text-secondary block mb-1">{t('blog.tags', lang)} (comma-separated)</label>
            <input className="w-full px-3 py-2 bg-bg-primary border border-border text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-3.5 h-3.5 accent-accent-blue" />
            <span className="text-[12px] text-text-secondary">{t('blog.published', lang)}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-3.5 h-3.5 accent-accent-blue" />
            <span className="text-[12px] text-text-secondary">Featured</span>
          </label>
        </div>

        <div className="flex gap-2">
          <Button variant="primary" loading={saving} onClick={() => handleSave(isPublished)}>
            {isPublished ? 'Update & Publish' : 'Update Draft'}
          </Button>
        </div>
      </div>
    </div>
  )
}
