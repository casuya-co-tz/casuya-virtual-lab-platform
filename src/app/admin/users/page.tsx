'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
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

export default function AdminUsersPage() {
  const { lang } = useLanguage()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('admin.users', lang)}</h1>
      <Card>
        <Table headers={[t('admin.tableName', lang), t('admin.tableEmail', lang), t('admin.tableRole', lang), t('admin.tableLanguage', lang), t('admin.tableJoined', lang), t('admin.tableActions', lang)]}>
          {users.map(u => (
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
        </Table>
      </Card>
    </div>
  )
}
