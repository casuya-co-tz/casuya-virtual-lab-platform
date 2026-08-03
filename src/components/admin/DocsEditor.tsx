'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface DocsEditorProps {
  initial?: {
    slug: string
    title: string
    content: string
    category: string
  }
  onSave: (data: { slug: string; title: string; content: string; category: string }) => Promise<void>
}

export function DocsEditor({ initial, onSave }: DocsEditorProps) {
  const [slug, setSlug] = useState(initial?.slug || '')
  const [title, setTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [category, setCategory] = useState(initial?.category || 'general')
  const [saving, setSaving] = useState(false)

  // Re-sync the form when a different document is opened.
  useEffect(() => {
    setSlug(initial?.slug || '')
    setTitle(initial?.title || '')
    setContent(initial?.content || '')
    setCategory(initial?.category || 'general')
  }, [initial?.slug, initial?.title, initial?.content, initial?.category])

  async function handleSave() {
    setSaving(true)
    await onSave({ slug, title, content, category })
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="api-overview" />
        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Input label="Category" value={category} onChange={e => setCategory(e.target.value)} />
      </div>
      <div>
        <label className="text-[12px] uppercase text-text-secondary tracking-[0.5px] block mb-1">Content (Markdown)</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full h-96 px-3 py-2 bg-bg-secondary border border-border text-[14px] text-text-primary font-mono resize-y focus:outline-none focus:ring-2 focus:ring-border-focus"
          placeholder="Write documentation in Markdown..."
        />
      </div>
      <Button variant="primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Publish Doc'}
      </Button>
    </div>
  )
}
