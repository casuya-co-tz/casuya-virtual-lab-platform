'use client'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
    html_code: '',
    subject: 'physics',
    is_published: true,
    is_premium: false,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/subtopics')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSubtopics(Array.isArray(data) ? data : []))
      .catch(() => setSubtopics([]))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error || t('admin.failedCreate', lang))
      return
    }
    router.push('/admin/labs')
    router.refresh()
  }

  return (
    <div className="mx-auto px-1 sm:px-2">
      <h1 className="text-[clamp(18px,4vw,26px)] font-bold text-text-primary mb-2">{t('admin.newLab', lang)}</h1>
      <div className="bg-bg-primary border border-border p-2">
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <Input label={t('admin.titleEnglish', lang)} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label={t('admin.titleSwahili', lang)} value={form.title_sw} onChange={e => setForm({ ...form, title_sw: e.target.value })} />
          <label className="text-[11px] font-bold uppercase text-text-secondary">{t('admin.description', lang)}</label>
          <textarea
            className="w-full border border-border bg-bg-primary text-text-primary p-1 text-[13px]"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <label className="text-[11px] font-bold uppercase text-text-secondary">Lab HTML / Three.js Code</label>
          <textarea
            className="w-full border border-border bg-bg-primary text-text-primary p-1 text-[13px] font-mono"
            rows={10}
            value={form.html_code}
            onChange={e => setForm({ ...form, html_code: e.target.value })}
            placeholder="Paste your lab HTML or Three.js code here..."
          />
          <LivePreview code={form.html_code} />
          <label className="text-[11px] font-bold uppercase text-text-secondary">{t('admin.subject', lang)}</label>
          <select
            className="w-full border border-border bg-bg-primary text-text-primary p-1 text-[13px]"
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
          >
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
          </select>
          <label className="text-[11px] font-bold uppercase text-text-secondary">{t('admin.subtopic', lang)}</label>
          <select
            className="w-full border border-border bg-bg-primary text-text-primary p-1 text-[13px]"
            value={form.subtopic_id}
            onChange={e => setForm({ ...form, subtopic_id: e.target.value })}
          >
            <option value="">{t('admin.selectSubtopic', lang)}</option>
            {subtopics.map(st => (
              <option key={st.id} value={st.id}>{st.title}</option>
            ))}
          </select>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} />
            <span className="text-[13px] text-text-primary">{t('admin.published', lang)}</span>
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} />
            <span className="text-[13px] text-text-primary">Premium</span>
          </label>
          {error && <p className="text-[11px] text-accent-red">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="primary" type="submit" className="w-full sm:w-auto">{t('admin.createLab', lang)}</Button>
            <Button variant="secondary" type="button" onClick={() => router.back()} className="w-full sm:w-auto">{t('common.cancel', lang)}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
