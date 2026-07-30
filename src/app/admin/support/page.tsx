'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Badge } from '@/components/ui/Badge'
import { Table, Tr, Td } from '@/components/ui/Table'

interface Ticket {
  id: string
  subject: string
  description: string
  priority: string
  status: string
  plan_tier: string
  user_name?: string
  user_email?: string
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
    <div className="mx-auto px-1 sm:px-2">
      <h1 className="text-[clamp(18px,4vw,26px)] font-bold text-text-primary mb-2">{t('support.title', lang)}</h1>

      {loading ? (
        <p className="text-text-secondary">{t('common.loading', lang)}</p>
      ) : tickets.length === 0 ? (
        <div className="bg-bg-primary border border-border p-2 text-center"><p className="text-[12px] text-text-secondary">{t('support.noTickets', lang)}</p></div>
      ) : (
        <div className="bg-bg-primary border border-border p-2">
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <Table headers={[
            t('support.subject', lang),
            lang === 'sw' ? 'Mteja' : 'User',
            t('support.priority', lang),
            'Status',
            'Tier',
            t('admin.tableCreated', lang),
          ]}>
            {tickets.map(ticket => (
              <Tr key={ticket.id}>
                <Td className="font-medium text-[12px]">{ticket.subject}</Td>
                <Td>
                  {ticket.user_name ? (
                    <div>
                      <p className="text-[12px] text-text-primary">{ticket.user_name}</p>
                      <p className="text-[10px] text-text-secondary">{ticket.user_email}</p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-disabled">-</span>
                  )}
                </Td>
                <Td><Badge variant={priorityVariant(ticket.priority) as 'info'}>{ticket.priority}</Badge></Td>
                <Td><Badge variant={ticket.status === 'open' ? 'info' : ticket.status === 'resolved' ? 'success' : 'neutral'}>{ticket.status}</Badge></Td>
                <Td className="text-[12px]">{ticket.plan_tier}</Td>
                <Td className="text-[12px]">{new Date(ticket.created_at).toLocaleDateString()}</Td>
            </Tr>
          ))}
          </Table>
          </div>
        </div>
      )}
    </div>
  )
}
