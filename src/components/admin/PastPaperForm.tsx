'use client'
import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface FormData {
  subject: string
  year: string
  paper_number: string
  exam_body: string
  title: string
  title_sw: string
  is_premium: boolean
  sort_order: string
  html_content: string
}

interface PastPaperFormProps {
  initialData?: Partial<FormData> & { id?: string }
  mode: 'create' | 'edit'
}

const subjectIcons: Record<string, string> = {
  physics: '\u269B',
  chemistry: '\u2697',
  biology: '\uD83E\uDDEA',
}

export default function PastPaperForm({ initialData, mode }: PastPaperFormProps) {
  const { lang } = useLanguage()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [charCount, setCharCount] = useState(initialData?.html_content?.length || 0)
  const [form, setForm] = useState<FormData>({
    subject: initialData?.subject || 'physics',
    year: initialData?.year?.toString() || '',
    paper_number: initialData?.paper_number?.toString() || '1',
    exam_body: initialData?.exam_body || 'NECTA',
    title: initialData?.title || '',
    title_sw: initialData?.title_sw || '',
    is_premium: initialData?.is_premium || false,
    sort_order: initialData?.sort_order?.toString() || '0',
    html_content: initialData?.html_content || '',
  })

  const subjects = [
    { value: 'physics', label: `${subjectIcons.physics} ${t('subject.physics', lang)}` },
    { value: 'chemistry', label: `${subjectIcons.chemistry} ${t('subject.chemistry', lang)}` },
    { value: 'biology', label: `${subjectIcons.biology} ${t('subject.biology', lang)}` },
  ]

  const update = (key: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'html_content' && typeof value === 'string') {
      setCharCount(value.length)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const url = mode === 'create'
      ? '/api/admin/past-papers'
      : `/api/admin/past-papers/${initialData?.id}`

    const res = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      router.push('/admin/past-papers')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-[13px] font-bold uppercase tracking-[1px] text-text-secondary">
          Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('admin.titleEnglish', lang)}
            value={form.title}
            onChange={e => update('title', e.target.value)}
            required
            placeholder="e.g. NECTA Biology Practical 2024"
          />
          <Input
            label={t('admin.titleSwahili', lang)}
            value={form.title_sw}
            onChange={e => update('title_sw', e.target.value)}
            required
            placeholder="e.g. Mtihani wa Biolojia 2024"
          />
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="space-y-4">
        <h2 className="text-[13px] font-bold uppercase tracking-[1px] text-text-secondary">
          Classification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label={t('admin.tableSubject', lang)}
            options={subjects}
            value={form.subject}
            onChange={e => update('subject', e.target.value)}
          />
          <Input
            label={t('admin.tableYear', lang)}
            type="number"
            value={form.year}
            onChange={e => update('year', e.target.value)}
            required
            placeholder="2024"
          />
          <Input
            label={t('admin.tablePaper', lang)}
            type="number"
            value={form.paper_number}
            onChange={e => update('paper_number', e.target.value)}
            required
            placeholder="1"
          />
          <Input
            label={t('admin.tableExamBody', lang)}
            value={form.exam_body}
            onChange={e => update('exam_body', e.target.value)}
            required
            placeholder="NECTA"
          />
          <Input
            label={t('admin.sortOrder', lang)}
            type="number"
            value={form.sort_order}
            onChange={e => update('sort_order', e.target.value)}
            placeholder="0"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] uppercase text-text-secondary tracking-[0.5px] font-medium">
              {t('admin.tablePremium', lang)}
            </label>
            <label className="flex items-center gap-3 h-[44px] px-4 bg-bg-secondary border border-border cursor-pointer hover:border-border-strong transition-colors">
              <input
                type="checkbox"
                checked={form.is_premium}
                onChange={e => update('is_premium', e.target.checked)}
                className="w-4 h-4 accent-accent-blue"
              />
              <span className="text-[14px] text-text-primary select-none">
                {form.is_premium ? t('pastPapers.premium', lang) : t('common.free', lang)}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold uppercase tracking-[1px] text-text-secondary">
            {t('admin.htmlContent', lang)}
          </h2>
          <span className="text-[11px] text-text-disabled font-mono">{charCount} chars</span>
        </div>
        <textarea
          value={form.html_content}
          onChange={e => update('html_content', e.target.value)}
          rows={15}
          className="w-full px-4 py-3 bg-bg-secondary border border-border text-[14px] text-text-primary font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-shadow"
          placeholder="Paste your HTML exam content here..."
        />
      </div>

      {error && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/20 text-accent-red text-[14px] rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={saving} className="sm:min-w-[160px]">
          {saving ? t('common.loading', lang) : mode === 'create' ? t('admin.createLab', lang) : t('common.save', lang)}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {t('common.cancel', lang)}
        </Button>
      </div>
    </form>
  )
}
