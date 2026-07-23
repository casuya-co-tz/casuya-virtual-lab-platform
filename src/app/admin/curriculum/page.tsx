'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Subtopic {
  id: string
  title: string
  title_sw: string
  sort_order: number
}

interface Topic {
  id: string
  title: string
  title_sw: string
  sort_order: number
  subtopics: Subtopic[] | null
}

interface Subject {
  id: string
  name: string
  name_sw: string
  icon: string
  sort_order: number
  topics: Topic[] | null
}

export default function CurriculumPage() {
  const { lang } = useLanguage()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)
  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  
  // Target IDs
  const [activeSubjectId, setActiveSubjectId] = useState('')
  const [activeTopicId, setActiveTopicId] = useState('')
  const [activeSubtopicId, setActiveSubtopicId] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({ title: '', title_sw: '', sort_order: 0 })

  const loadData = () => {
    setLoading(true)
    fetch('/api/subjects')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setSubjects(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  // Topic Handlers
  const openTopicModal = (mode: 'create' | 'edit', subjectId: string, topic?: Topic) => {
    setModalMode(mode)
    setActiveSubjectId(subjectId)
    if (mode === 'edit' && topic) {
      setActiveTopicId(topic.id)
      setFormData({ title: topic.title, title_sw: topic.title_sw, sort_order: topic.sort_order })
    } else {
      setFormData({ title: '', title_sw: '', sort_order: 0 })
    }
    setIsTopicModalOpen(true)
  }

  const saveTopic = async () => {
    const url = '/api/topics'
    const method = modalMode === 'create' ? 'POST' : 'PUT'
    const body = modalMode === 'create' 
      ? { subject_id: activeSubjectId, ...formData }
      : { id: activeTopicId, ...formData }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    if (res.ok) {
      setIsTopicModalOpen(false)
      loadData()
    } else {
      alert('Error saving topic')
    }
  }

  const deleteTopic = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm', lang) || 'Are you sure?')) return
    const res = await fetch('/api/topics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) loadData()
  }

  // Subtopic Handlers
  const openSubtopicModal = (mode: 'create' | 'edit', topicId: string, subtopic?: Subtopic) => {
    setModalMode(mode)
    setActiveTopicId(topicId)
    if (mode === 'edit' && subtopic) {
      setActiveSubtopicId(subtopic.id)
      setFormData({ title: subtopic.title, title_sw: subtopic.title_sw, sort_order: subtopic.sort_order })
    } else {
      setFormData({ title: '', title_sw: '', sort_order: 0 })
    }
    setIsSubtopicModalOpen(true)
  }

  const saveSubtopic = async () => {
    const url = '/api/subtopics'
    const method = modalMode === 'create' ? 'POST' : 'PUT'
    const body = modalMode === 'create' 
      ? { topic_id: activeTopicId, ...formData }
      : { id: activeSubtopicId, ...formData }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    if (res.ok) {
      setIsSubtopicModalOpen(false)
      loadData()
    } else {
      alert('Error saving subtopic')
    }
  }

  const deleteSubtopic = async (id: string) => {
    if (!confirm(t('admin.deleteConfirm', lang) || 'Are you sure?')) return
    const res = await fetch('/api/subtopics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) loadData()
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.curriculum', lang)}</h1>
      
      <div className="space-y-6">
        {subjects.map(subject => (
          <Card key={subject.id}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{subject.icon}</span>
              <h2 className="text-xl font-bold text-text-primary">
                {lang === 'sw' ? subject.name_sw : subject.name}
              </h2>
            </div>
            
            <div className="space-y-4">
              {subject.topics && subject.topics.filter(t => t.id).map(topic => (
                <div key={topic.id} className="border border-border-DEFAULT p-3 sm:p-4 bg-bg-secondary ml-2 sm:ml-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-3 gap-2">
                    <h3 className="font-bold text-text-primary">
                      {lang === 'sw' ? topic.title_sw : topic.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openSubtopicModal('create', topic.id)} className="text-[12px] text-accent-blue underline">
                        + {t('admin.addSubtopic', lang)}
                      </button>
                      <button onClick={() => openTopicModal('edit', subject.id, topic)} className="text-[12px] text-text-secondary underline">
                        {t('admin.editTopic', lang) || 'Edit'}
                      </button>
                      <button onClick={() => deleteTopic(topic.id)} className="text-[12px] text-accent-red underline">
                        {t('admin.deleteTopic', lang) || 'Delete'}
                      </button>
                    </div>
                  </div>
                  
                  {topic.subtopics && topic.subtopics.filter(st => st.id).length > 0 ? (
                    <div className="ml-2 sm:ml-4 space-y-2">
                      {topic.subtopics.filter(st => st.id).map(subtopic => (
                        <div key={subtopic.id} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border border-border-strong p-2 bg-bg-primary gap-2">
                          <span className="text-[14px] text-text-secondary">
                            {lang === 'sw' ? subtopic.title_sw : subtopic.title}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => openSubtopicModal('edit', topic.id, subtopic)} className="text-[12px] text-text-secondary underline">
                              {t('admin.editSubtopic', lang) || 'Edit'}
                            </button>
                            <button onClick={() => deleteSubtopic(subtopic.id)} className="text-[12px] text-accent-red underline">
                              {t('admin.deleteSubtopic', lang) || 'Delete'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ml-2 sm:ml-4 text-[12px] text-text-disabled">No subtopics.</p>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={() => openTopicModal('create', subject.id)} className="ml-2 sm:ml-4">
                + {t('admin.addTopic', lang)}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for Topic */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-bg-primary p-4 sm:p-6 w-full max-w-md border border-border-DEFAULT shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-text-primary">
              {modalMode === 'create' ? t('admin.addTopic', lang) : t('admin.editTopic', lang)}
            </h2>
            <div className="space-y-4">
              <Input label="Title (English)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <Input label="Title (Swahili)" value={formData.title_sw} onChange={e => setFormData({...formData, title_sw: e.target.value})} />
              <Input label="Sort Order" type="number" value={formData.sort_order.toString()} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setIsTopicModalOpen(false)}>{t('common.cancel', lang)}</Button>
              <Button variant="primary" className="flex-1" onClick={saveTopic}>{t('common.save', lang)}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Subtopic */}
      {isSubtopicModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-bg-primary p-4 sm:p-6 w-full max-w-md border border-border-DEFAULT shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-text-primary">
              {modalMode === 'create' ? t('admin.addSubtopic', lang) : t('admin.editSubtopic', lang)}
            </h2>
            <div className="space-y-4">
              <Input label="Title (English)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <Input label="Title (Swahili)" value={formData.title_sw} onChange={e => setFormData({...formData, title_sw: e.target.value})} />
              <Input label="Sort Order" type="number" value={formData.sort_order.toString()} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setIsSubtopicModalOpen(false)}>{t('common.cancel', lang)}</Button>
              <Button variant="primary" className="flex-1" onClick={saveSubtopic}>{t('common.save', lang)}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
