'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'

interface Lab {
  id: string
  title: string
  subject: string
  subject_name: string
  is_published: boolean
  version: number
  created_at: string
  subtopic_title: string
  topic_title: string
  creator_name: string
}

export default function AdminLabsPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/labs')
      .then(r => r.json())
      .then(data => { setLabs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm(t('admin.deleteConfirm', lang))) return
    await fetch(`/api/labs/${id}`, { method: 'DELETE' })
    setLabs(labs.filter(l => l.id !== id))
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('admin.labs', lang)}</h1>
        <Button variant="primary" onClick={() => router.push('/admin/labs/new')}>{t('admin.newLab', lang)}</Button>
      </div>
      <Card>
        <Table headers={[t('admin.tableTitle', lang), t('admin.tableSubject', lang), t('admin.tableStatus', lang), t('admin.tableVersion', lang), t('admin.tableCreated', lang), t('admin.tableActions', lang)]}>
          {labs.map(lab => (
            <Tr key={lab.id}>
              <Td>{lab.title}</Td>
              <Td>{lab.subject_name || lab.subject}</Td>
              <Td><Badge variant={lab.is_published ? 'success' : 'neutral'}>{lab.is_published ? t('admin.published', lang) : t('admin.draft', lang)}</Badge></Td>
              <Td>v{lab.version}</Td>
              <Td>{new Date(lab.created_at).toLocaleDateString()}</Td>
              <Td>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/admin/labs/${lab.id}`)} className="text-[12px] text-accent-blue underline">{t('admin.edit', lang)}</button>
                  <button onClick={() => handleDelete(lab.id)} className="text-[12px] text-accent-red underline">{t('admin.delete', lang)}</button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
