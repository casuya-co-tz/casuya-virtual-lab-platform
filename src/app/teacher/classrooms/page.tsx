'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface Classroom {
  id: string
  name: string
  class_code: string
  subject: string | null
  max_students: number
  student_count: number
  created_at: string
}

export default function ClassroomsPage() {
  const { lang } = useLanguage()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinMsg, setJoinMsg] = useState('')

  useEffect(() => {
    fetch('/api/teacher/classrooms')
      .then(r => r.json())
      .then(d => { setClassrooms(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!newName) return
    const res = await fetch('/api/teacher/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, subject: newSubject || null }),
    })
    if (res.ok) {
      const data = await res.json()
      setClassrooms([data, ...classrooms])
      setShowCreate(false)
      setNewName('')
      setNewSubject('')
    }
  }

  async function handleJoin() {
    if (!joinCode) return
    setJoinMsg('')
    const res = await fetch('/api/student/classrooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_code: joinCode }),
    })
    if (res.ok) {
      setJoinMsg(t('classrooms.joined', lang))
      setJoinCode('')
    } else {
      const data = await res.json()
      setJoinMsg(data.error || 'Error')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('common.confirm', lang))) return
    await fetch(`/api/teacher/classrooms/${id}`, { method: 'DELETE' })
    setClassrooms(classrooms.filter(c => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-bg-secondary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('classrooms.title', lang)}</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(!showCreate)}>{t('classrooms.newClassroom', lang)}</Button>
          </div>
        </div>

        <Card className="mb-6">
          <h3 className="text-[14px] font-bold text-text-primary mb-3">{t('classrooms.joinByCode', lang)}</h3>
          <div className="flex gap-3 items-end">
            <Input
              placeholder={t('classrooms.enterCode', lang)}
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              className="max-w-xs"
            />
            <Button variant="primary" className="!h-10" onClick={handleJoin}>{t('classrooms.join', lang)}</Button>
          </div>
          {joinMsg && <p className="text-[13px] mt-2 text-accent-green">{joinMsg}</p>}
        </Card>

        {showCreate && (
          <Card className="mb-6">
            <h3 className="text-[14px] font-bold text-text-primary mb-3">{t('classrooms.newClassroom', lang)}</h3>
            <div className="flex flex-col gap-3 max-w-md">
              <Input label={t('classrooms.className', lang)} value={newName} onChange={e => setNewName(e.target.value)} />
              <div className="flex gap-2">
                {['physics', 'chemistry', 'biology'].map(s => (
                  <button
                    key={s}
                    onClick={() => setNewSubject(s === newSubject ? '' : s)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                      newSubject === s ? 'bg-accent-blue text-white' : 'bg-bg-secondary border border-border-default text-text-secondary'
                    }`}
                  >
                    {t(`subject.${s}`, lang)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleCreate}>{t('common.save', lang)}</Button>
                <Button variant="secondary" onClick={() => setShowCreate(false)}>{t('common.cancel', lang)}</Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-text-secondary">{t('common.loading', lang)}</p>
        ) : classrooms.length === 0 ? (
          <Card className="text-center py-12"><p className="text-text-secondary">{t('classrooms.noClassrooms', lang)}</p></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classrooms.map(c => (
              <Card key={c.id} hover>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-text-primary">{c.name}</h3>
                    {c.subject && <p className="text-[12px] text-text-secondary">{t(`subject.${c.subject}`, lang)}</p>}
                  </div>
                  <Badge variant="info">{c.class_code}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-text-secondary">
                    {c.student_count} / {c.max_students} {t('classrooms.students', lang)}
                  </span>
                  <button onClick={() => handleDelete(c.id)} className="text-[12px] text-accent-red underline">{t('admin.delete', lang)}</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
