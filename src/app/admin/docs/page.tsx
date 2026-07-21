'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { DocsEditor } from '@/components/admin/DocsEditor'
import { Card } from '@/components/ui/Card'
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
      .then(r => r.json())
      .then(() => { setDocs([]); setLoading(false) })
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
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  if (creating || editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">
            {editing ? t('admin.editDocument', lang) : t('admin.newDocument', lang)}
          </h1>
          <Button variant="ghost" onClick={() => { setEditing(null); setCreating(false) }}>{t('common.cancel', lang)}</Button>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('admin.docs', lang)}</h1>
        <Button variant="primary" onClick={() => setCreating(true)}>{t('admin.newDoc', lang)}</Button>
      </div>
      {docs.length === 0 ? (
        <Card>
          <p className="text-[14px] text-text-secondary text-center py-8">{t('admin.noDocs', lang)}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <Card key={doc.id} hover interactive onClick={() => setEditing(doc)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-text-primary">{doc.title}</h3>
                  <p className="text-[12px] text-text-secondary">/{doc.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.published ? 'success' : 'neutral'}>{doc.category}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
