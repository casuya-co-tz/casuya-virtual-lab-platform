'use client'
import { useEffect, useState, useMemo } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  language: string
  created_at: string
}

const PAGE_SIZE = 20

export default function AdminUsersPage() {
  const { lang } = useLanguage()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (search) {
        const q = search.toLowerCase()
        if (!u.full_name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false
      }
      if (filterRole !== 'all' && u.role !== filterRole) return false
      return true
    })
  }, [users, search, filterRole])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  async function toggleRole(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'student' : 'admin'
    if (!confirm(currentRole === 'admin' ? 'Demote this user to student?' : 'Promote this user to admin?')) return
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role: newRole }),
    })
    if (res.ok) {
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u))
    }
  }

  if (loading) return <p className="text-text-secondary">{t('admin.loading', lang)}</p>

  return (
    <div>
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-2">{t('admin.users', lang)}</h1>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-2">
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder={lang === 'sw' ? 'Tafuta kwa jina au barua pepe...' : 'Search by name or email...'}
          className="w-full sm:flex-1 sm:min-w-[200px]"
        />
        <select
          value={filterRole}
          onChange={e => { setFilterRole(e.target.value); setPage(0) }}
          className="w-full sm:w-auto px-1 py-1 border border-border bg-bg-primary text-text-primary text-[12px]"
        >
          <option value="all">{lang === 'sw' ? 'Majukumu Yote' : 'All Roles'}</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="developer">Developer</option>
        </select>
      </div>

      <p className="text-[12px] text-text-secondary mb-2">
        {filtered.length} {lang === 'sw' ? 'watumiaji' : 'users'}
        {search && ` — "${search}"`}
      </p>

      <div className="bg-bg-primary border border-border p-2">
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <div className="min-w-[600px] sm:min-w-0">
        <Table headers={[t('admin.tableName', lang), t('admin.tableEmail', lang), t('admin.tableRole', lang), t('admin.tableLanguage', lang), t('admin.tableJoined', lang), t('admin.tableActions', lang)]}>
          {paged.map(u => (
            <Tr key={u.id}>
              <Td>{u.full_name}</Td>
              <Td>{u.email}</Td>
              <Td><Badge variant={u.role === 'admin' ? 'info' : 'neutral'}>{u.role}</Badge></Td>
              <Td>{u.language?.toUpperCase()}</Td>
              <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
              <Td>
                <button onClick={() => toggleRole(u.id, u.role)} className="text-[12px] text-accent-blue underline">
                  {u.role === 'admin' ? t('admin.makeStudent', lang) : t('admin.makeAdmin', lang)}
                </button>
              </Td>
            </Tr>
          ))}
          {paged.length === 0 && (
            <Tr><Td colSpan={6} className="text-center text-text-secondary py-2">{t('admin.noData', lang)}</Td></Tr>
          )}
        </Table>
          </div>
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
