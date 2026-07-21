'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'

interface LabEditorProps {
  initial?: {
    id?: string
    title: string
    title_sw: string
    description: string
    subject: string
    subtopic_id: string
    is_published: boolean
    html_threejs_code: string
  }
  onSave: (data: Record<string, unknown>) => Promise<void>
}

export function LabEditor({ initial, onSave }: LabEditorProps) {
  const [title, setTitle] = useState(initial?.title || '')
  const [titleSw, setTitleSw] = useState(initial?.title_sw || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [subject, setSubject] = useState(initial?.subject || 'physics')
  const [subtopicId, setSubtopicId] = useState(initial?.subtopic_id || '')
  const [published, setPublished] = useState(initial?.is_published || false)
  const [code, setCode] = useState(initial?.html_threejs_code || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave({ title, title_sw: titleSw, description, subject, subtopic_id: subtopicId, is_published: published, html_threejs_code: code })
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Title (English)" value={title} onChange={e => setTitle(e.target.value)} />
        <Input label="Title (Swahili)" value={titleSw} onChange={e => setTitleSw(e.target.value)} />
      </div>
      <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          options={[
            { value: 'physics', label: 'Physics' },
            { value: 'chemistry', label: 'Chemistry' },
            { value: 'biology', label: 'Biology' },
          ]}
        />
        <Input label="Subtopic ID" value={subtopicId} onChange={e => setSubtopicId(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Toggle checked={published} onChange={setPublished} />
        <span className="text-[14px] text-text-primary">{published ? 'Published' : 'Draft'}</span>
      </div>
      <div>
        <label className="text-[12px] uppercase text-text-secondary tracking-[0.5px] block mb-1">Lab HTML Code</label>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full h-64 px-3 py-2 bg-bg-secondary border border-border-DEFAULT text-[14px] text-text-primary font-mono resize-y focus:outline-none focus:ring-2 focus:ring-border-focus"
          placeholder="Paste lab HTML/Three.js code here..."
        />
      </div>
      <Button variant="primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : initial?.id ? 'Update Lab' : 'Create Lab'}
      </Button>
    </div>
  )
}
