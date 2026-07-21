'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'

interface Topic {
  title: string
  title_sw: string
  subtopics: { title: string; title_sw: string }[]
}

interface CurriculumBuilderProps {
  subject: string
  onSave: (topics: Topic[]) => Promise<void>
}

export function CurriculumBuilder({ subject, onSave }: CurriculumBuilderProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [saving, setSaving] = useState(false)

  function addTopic() {
    setTopics(prev => [...prev, { title: '', title_sw: '', subtopics: [{ title: '', title_sw: '' }] }])
  }

  function updateTopic(index: number, field: keyof Topic, value: string) {
    setTopics(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  function addSubtopic(topicIndex: number) {
    setTopics(prev => prev.map((t, i) => i === topicIndex ? { ...t, subtopics: [...t.subtopics, { title: '', title_sw: '' }] } : t))
  }

  function updateSubtopic(topicIndex: number, subIndex: number, field: string, value: string) {
    setTopics(prev => prev.map((t, i) => {
      if (i !== topicIndex) return t
      return { ...t, subtopics: t.subtopics.map((s, j) => j === subIndex ? { ...s, [field]: value } : s) }
    }))
  }

  function removeTopic(index: number) {
    setTopics(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    await onSave(topics)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-text-primary capitalize">{subject} Curriculum</h3>
        <Button variant="secondary" onClick={addTopic}>+ Add Topic</Button>
      </div>

      {topics.length === 0 && (
        <Card>
          <p className="text-[14px] text-text-secondary text-center py-4">No topics yet. Click "Add Topic" to start building the curriculum.</p>
        </Card>
      )}

      {topics.map((topic, ti) => (
        <Card key={ti}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] text-text-secondary uppercase">Topic {ti + 1}</span>
            <button onClick={() => removeTopic(ti)} className="text-[12px] text-accent-red underline">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input label="Title (EN)" value={topic.title} onChange={e => updateTopic(ti, 'title', e.target.value)} />
            <Input label="Title (SW)" value={topic.title_sw} onChange={e => updateTopic(ti, 'title_sw', e.target.value)} />
          </div>

          <div className="border-t border-border-DEFAULT pt-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-text-secondary">Subtopics</span>
              <button onClick={() => addSubtopic(ti)} className="text-[12px] text-accent-blue underline">+ Add</button>
            </div>
            {topic.subtopics.map((sub, si) => (
              <div key={si} className="grid grid-cols-2 gap-3 mb-2">
                <Input value={sub.title} onChange={e => updateSubtopic(ti, si, 'title', e.target.value)} placeholder="Subtopic (EN)" />
                <Input value={sub.title_sw} onChange={e => updateSubtopic(ti, si, 'title_sw', e.target.value)} placeholder="Subtopic (SW)" />
              </div>
            ))}
          </div>
        </Card>
      ))}

      {topics.length > 0 && (
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Curriculum'}
        </Button>
      )}
    </div>
  )
}
