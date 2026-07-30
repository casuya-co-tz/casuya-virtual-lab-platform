'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'

interface Lab {
  id: string
  title: string
  title_sw: string | null
  subject: string
  description: string | null
  description_sw: string | null
  is_premium: boolean
  is_published: boolean
  current_version: number
  updated_at: string
}

const PAGE_SIZE = 20

export default function AdminLabsPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetch('/api/labs')
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => { setLabs(Array.isArray(json.data) ? json.data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return labs.filter(lab => {
      if (search && !lab.title.toLowerCase().includes(search.toLowerCase())) return false
      if (filterSubject !== 'all' && lab.subject !== filterSubject) return false
      if (filterStatus === 'published' && !lab.is_published) return false
      if (filterStatus === 'draft' && lab.is_published) return false
      return true
    })
  }, [labs, search, filterSubject, filterStatus])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  async function handleDelete(id: string) {
    if (!confirm(t('admin.deleteConfirm', lang))) return
    try {
      const res = await fetch(`/api/labs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLabs(labs.filter(l => l.id !== id))
      }
    } catch {}
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <h1 className="text-[clamp(18px,4vw,26px)] font-bold text-text-primary">{t('admin.labs', lang)}</h1>
        <Button variant="primary" onClick={() => router.push('/admin/labs/new')} className="w-full sm:w-auto">{t('admin.newLab', lang)}</Button>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-2">
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder={lang === 'sw' ? 'Tafuta maabara...' : 'Search labs...'}
          className="w-full sm:flex-1 sm:min-w-[200px]"
        />
        <select
          value={filterSubject}
          onChange={e => { setFilterSubject(e.target.value); setPage(0) }}
          className="w-full sm:w-auto px-1 py-1 border border-border bg-bg-primary text-text-primary text-[12px]"
        >
          <option value="all">{lang === 'sw' ? 'Masomo Yote' : 'All Subjects'}</option>
          <option value="physics">{lang === 'sw' ? 'Fizikia' : 'Physics'}</option>
          <option value="chemistry">{lang === 'sw' ? 'Kemia' : 'Chemistry'}</option>
          <option value="biology">{lang === 'sw' ? 'Biolojia' : 'Biology'}</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(0) }}
          className="w-full sm:w-auto px-1 py-1 border border-border bg-bg-primary text-text-primary text-[12px]"
        >
          <option value="all">{lang === 'sw' ? 'Halimshote Yote' : 'All Status'}</option>
          <option value="published">{t('admin.published', lang)}</option>
          <option value="draft">{t('admin.draft', lang)}</option>
        </select>
      </div>

      <p className="text-[11px] text-text-secondary mb-2">
        {filtered.length} {lang === 'sw' ? 'maabara' : 'labs'}
        {search && ` — "${search}"`}
      </p>

      <div className="-mx-4 sm:mx-0 border-t sm:border border-border bg-bg-primary">
        <div className="overflow-x-auto">
        <Table headers={[t('admin.tableTitle', lang), t('admin.tableSubject', lang), t('admin.tableStatus', lang), t('admin.tableVersion', lang), t('admin.tableCreated', lang), t('admin.tableActions', lang)]}>
          {paged.map(lab => (
            <Tr key={lab.id}>
              <Td className="whitespace-nowrap text-[12px]">{lab.title}</Td>
              <Td className="whitespace-nowrap text-[12px]">{lab.subject}</Td>
              <Td className="whitespace-nowrap">
                <Badge variant={lab.is_published ? 'success' : 'neutral'}>{lab.is_published ? t('admin.published', lang) : t('admin.draft', lang)}</Badge>
                {lab.is_premium && <Badge variant="warning" className="ml-1">Premium</Badge>}
              </Td>
              <Td className="whitespace-nowrap text-[12px]">v{lab.current_version}</Td>
              <Td className="whitespace-nowrap text-[12px]">{new Date(lab.updated_at).toLocaleDateString()}</Td>
              <Td className="whitespace-nowrap">
                <div className="flex gap-1">
                  <button onClick={() => router.push(`/admin/labs/${lab.id}`)} className="text-[11px] text-accent-blue underline whitespace-nowrap">{t('admin.edit', lang)}</button>
                  <button onClick={() => handleDelete(lab.id)} className="text-[11px] text-accent-red underline whitespace-nowrap">{t('admin.delete', lang)}</button>
                </div>
              </Td>
            </Tr>
          ))}
          {paged.length === 0 && (
            <Tr><Td colSpan={6} className="text-center text-text-secondary py-2">{t('admin.noData', lang)}</Td></Tr>
          )}
        </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-2">
          <Button variant="secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="w-full sm:w-auto">
            {t('admin.previous', lang)}
          </Button>
          <span className="text-[12px] text-text-secondary">
            {t('admin.page', lang)} {page + 1} / {totalPages}
          </span>
          <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="w-full sm:w-auto">
            {t('admin.next', lang)}
          </Button>
        </div>
      )}
    </div>
  )
}
