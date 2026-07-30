'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
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
    <div className="min-h-screen bg-bg-secondary px-1 py-3">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h1 className="text-[clamp(18px,4vw,24px)] font-bold text-text-primary">{t('classrooms.title', lang)}</h1>
          <Button variant="secondary" onClick={() => setShowCreate(!showCreate)} className="w-full sm:w-auto">{t('classrooms.newClassroom', lang)}</Button>
        </div>

        <div className="mb-3 bg-bg-primary border border-border p-2">
          <h3 className="text-[12px] font-bold text-text-primary mb-2">{t('classrooms.joinByCode', lang)}</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <Input
              placeholder={t('classrooms.enterCode', lang)}
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              className="w-full sm:max-w-xs"
            />
            <Button variant="primary" className="!h-10 w-full sm:w-auto" onClick={handleJoin}>{t('classrooms.join', lang)}</Button>
          </div>
          {joinMsg && <p className="text-[11px] mt-1 text-accent-green">{joinMsg}</p>}
        </div>

        {showCreate && (
          <div className="mb-3 bg-bg-primary border border-border p-2">
            <h3 className="text-[12px] font-bold text-text-primary mb-2">{t('classrooms.newClassroom', lang)}</h3>
            <div className="flex flex-col gap-2 max-w-md">
              <Input label={t('classrooms.className', lang)} value={newName} onChange={e => setNewName(e.target.value)} />
              <div className="flex gap-2">
                {['physics', 'chemistry', 'biology'].map(s => (
                  <button
                    key={s}
                    onClick={() => setNewSubject(s === newSubject ? '' : s)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                      newSubject === s ? 'bg-accent-blue text-white' : 'bg-bg-secondary border border-border text-text-secondary'
                    }`}
                  >
                    {t(`subject.${s}`, lang)}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="primary" onClick={handleCreate} className="w-full sm:w-auto">{t('common.save', lang)}</Button>
                <Button variant="secondary" onClick={() => setShowCreate(false)} className="w-full sm:w-auto">{t('common.cancel', lang)}</Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-text-secondary">{t('common.loading', lang)}</p>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-6 bg-bg-primary border border-border p-2"><p className="text-[12px] text-text-secondary">{t('classrooms.noClassrooms', lang)}</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2">
            {classrooms.map(c => (
              <div key={c.id} className="bg-bg-primary border border-border p-2 hover:bg-bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[13px] font-bold text-text-primary">{c.name}</h3>
                    {c.subject && <p className="text-[10px] text-text-secondary">{t(`subject.${c.subject}`, lang)}</p>}
                  </div>
                  <Badge variant="info">{c.class_code}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-secondary">
                    {c.student_count} / {c.max_students} {t('classrooms.students', lang)}
                  </span>
                  <button onClick={() => handleDelete(c.id)} className="text-[10px] text-accent-red underline">{t('admin.delete', lang)}</button>
                </div>
          </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
