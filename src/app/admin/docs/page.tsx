'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { DocsEditor } from '@/components/admin/DocsEditor'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface Doc {
  id: string
  slug: string
  title: string
  content: string
  category: string
  published: boolean
  updated_at: string
}

export default function AdminDocsPage() {
  const { lang } = useLanguage()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Doc | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const docEntries = data
            .filter((s: { key: string }) => s.key?.startsWith('doc:'))
            .map((s: { key: string; value: Record<string, string> }) => ({
              id: s.key,
              slug: s.key.replace('doc:', ''),
              title: s.value?.title || s.key.replace('doc:', ''),
              content: s.value?.content || '',
              category: s.value?.category || 'general',
              published: true,
              updated_at: '',
            }))
          setDocs(docEntries)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(data: { slug: string; title: string; content: string; category: string }) {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: `doc:${data.slug}`, value: data }),
    })
    setEditing(null)
    setCreating(false)
    setLoading(true)
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const docEntries = data
            .filter((s: { key: string }) => s.key?.startsWith('doc:'))
            .map((s: { key: string; value: Record<string, string> }) => ({
              id: s.key,
              slug: s.key.replace('doc:', ''),
              title: s.value?.title || s.key.replace('doc:', ''),
              content: s.value?.content || '',
              category: s.value?.category || 'general',
              published: true,
              updated_at: '',
            }))
          setDocs(docEntries)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  if (creating || editing) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <h1 className="text-[clamp(18px,4vw,26px)] font-bold text-text-primary">
            {editing ? t('admin.editDocument', lang) : t('admin.newDocument', lang)}
          </h1>
          <Button variant="ghost" onClick={() => { setEditing(null); setCreating(false) }} className="w-full sm:w-auto">{t('common.cancel', lang)}</Button>
        </div>
        <DocsEditor
          initial={editing ? { slug: editing.slug, title: editing.title, content: editing.content, category: editing.category } : undefined}
          onSave={handleSave}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
        <h1 className="text-[clamp(18px,4vw,26px)] font-bold text-text-primary">{t('admin.docs', lang)}</h1>
        <Button variant="primary" onClick={() => setCreating(true)} className="w-full sm:w-auto">{t('admin.newDoc', lang)}</Button>
      </div>
      {docs.length === 0 ? (
        <div className="bg-bg-primary border border-border p-2">
          <p className="text-[13px] text-text-secondary text-center py-4">{t('admin.noDocs', lang)}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {docs.map(doc => (
            <div key={doc.id} className="bg-bg-primary border border-border p-2 hover:cursor-pointer" onClick={() => setEditing(doc)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[13px] font-bold text-text-primary">{doc.title}</h3>
                  <p className="text-[11px] text-text-secondary">/{doc.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={doc.published ? 'success' : 'neutral'}>{doc.category}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
