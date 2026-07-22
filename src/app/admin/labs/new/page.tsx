'use client'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LivePreview } from '@/components/admin/LivePreview'

interface Subtopic {
  id: string
  title: string
  topic_title?: string
}

export default function NewLabPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [subtopics, setSubtopics] = useState<Subtopic[]>([])
  const [form, setForm] = useState({
    subtopic_id: '',
    title: '',
    title_sw: '',
    description: '',
    html_threejs_code: '',
    subject: 'physics',
    is_published: false,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/subtopics')
      .then(r => r.json())
      .then(setSubtopics)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { setError(t('admin.failedCreate', lang)); return }
    router.push('/admin/labs')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.newLab', lang)}</h1>
      <Card>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input label={t('admin.titleEnglish', lang)} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label={t('admin.titleSwahili', lang)} value={form.title_sw} onChange={e => setForm({ ...form, title_sw: e.target.value })} />
          <label className="text-[12px] font-bold uppercase text-text-secondary">{t('admin.description', lang)}</label>
          <textarea
            className="w-full border border-border-DEFAULT bg-bg-primary text-text-primary p-3 text-[14px]"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <label className="text-[12px] font-bold uppercase text-text-secondary">Lab HTML / Three.js Code</label>
          <textarea
            className="w-full border border-border-DEFAULT bg-bg-primary text-text-primary p-3 text-[14px] font-mono"
            rows={10}
            value={form.html_threejs_code}
            onChange={e => setForm({ ...form, html_threejs_code: e.target.value })}
            placeholder="Paste your lab HTML or Three.js code here..."
          />
          <LivePreview code={form.html_threejs_code} />
          <label className="text-[12px] font-bold uppercase text-text-secondary">{t('admin.subject', lang)}</label>
          <select
            className="w-full border border-border-DEFAULT bg-bg-primary text-text-primary p-3 text-[14px]"
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
          >
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
          </select>
          <label className="text-[12px] font-bold uppercase text-text-secondary">{t('admin.subtopic', lang)}</label>
          <select
            className="w-full border border-border-DEFAULT bg-bg-primary text-text-primary p-3 text-[14px]"
            value={form.subtopic_id}
            onChange={e => setForm({ ...form, subtopic_id: e.target.value })}
          >
            <option value="">{t('admin.selectSubtopic', lang)}</option>
            {subtopics.map(st => (
              <option key={st.id} value={st.id}>{st.title}</option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} />
            <span className="text-[14px] text-text-primary">{t('admin.published', lang)}</span>
          </label>
          {error && <p className="text-[12px] text-accent-red">{error}</p>}
          <div className="flex gap-3">
            <Button variant="primary" type="submit">{t('admin.createLab', lang)}</Button>
            <Button variant="secondary" type="button" onClick={() => router.back()}>{t('common.cancel', lang)}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
