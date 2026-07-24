'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'

interface Ticket {
  id: string
  subject: string
  description: string
  priority: string
  status: string
  plan_tier: string
  user_id: string
  created_at: string
  updated_at: string
}

export default function AdminSupportPage() {
  const { lang } = useLanguage()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/support/tickets')
      .then(r => r.json())
      .then(d => { setTickets(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const priorityVariant = (p: string) => {
    if (p === 'urgent') return 'danger'
    if (p === 'high') return 'warning'
    if (p === 'normal') return 'info'
    return 'neutral'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary mb-6">{t('support.title', lang)}</h1>

      {loading ? (
        <p className="text-text-secondary">{t('common.loading', lang)}</p>
      ) : tickets.length === 0 ? (
        <Card className="text-center py-12"><p className="text-text-secondary">{t('support.noTickets', lang)}</p></Card>
      ) : (
        <Card>
          <Table headers={[t('support.subject', lang), t('support.priority', lang), 'Status', 'Tier', t('admin.tableCreated', lang)]}>
            {tickets.map(ticket => (
              <Tr key={ticket.id}>
                <Td className="font-medium">{ticket.subject}</Td>
                <Td><Badge variant={priorityVariant(ticket.priority) as 'info'}>{ticket.priority}</Badge></Td>
                <Td><Badge variant={ticket.status === 'open' ? 'info' : ticket.status === 'resolved' ? 'success' : 'neutral'}>{ticket.status}</Badge></Td>
                <Td>{ticket.plan_tier}</Td>
                <Td>{new Date(ticket.created_at).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  )
}
