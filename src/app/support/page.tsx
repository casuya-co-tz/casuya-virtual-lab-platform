'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { t } from '@/lib/i18n'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface Ticket {
  id: string
  subject: string
  description: string
  priority: string
  status: string
  plan_tier: string
  created_at: string
  messages?: Array<{ id: string; message: string; sender_name: string; created_at: string }>
}

export default function SupportPage() {
  const { lang } = useLanguage()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    fetch('/api/support/tickets')
      .then(r => r.json())
      .then(d => { setTickets(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!subject || !description) return
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description, priority }),
    })
    if (res.ok) {
      const ticket = await res.json()
      setTickets([ticket, ...tickets])
      setShowCreate(false)
      setSubject('')
      setDescription('')
      setPriority('normal')
    }
  }

  async function handleSendMessage() {
    if (!selectedTicket || !newMessage) return
    const res = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage }),
    })
    if (res.ok) {
      const msg = await res.json()
      setSelectedTicket({
        ...selectedTicket,
        messages: [...(selectedTicket.messages || []), { ...msg, sender_name: 'You' }],
      })
      setNewMessage('')
    }
  }

  async function openTicket(ticket: Ticket) {
    const res = await fetch(`/api/support/tickets/${ticket.id}`)
    if (res.ok) {
      const data = await res.json()
      setSelectedTicket(data)
    } else {
      setSelectedTicket(ticket)
    }
  }

  const statusVariant = (s: string) => {
    if (s === 'open') return 'info'
    if (s === 'in_progress') return 'warning'
    if (s === 'resolved') return 'success'
    return 'neutral'
  }

  return (
    <div className="min-h-screen bg-bg-secondary px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[clamp(20px,4vw,28px)] font-bold text-text-primary">{t('support.title', lang)}</h1>
          <Button variant="primary" onClick={() => setShowCreate(true)}>{t('support.newTicket', lang)}</Button>
        </div>

        {showCreate && (
          <Card className="mb-6">
            <h3 className="text-[14px] font-bold text-text-primary mb-3">{t('support.newTicket', lang)}</h3>
            <div className="flex flex-col gap-3 max-w-md">
              <Input label={t('support.subject', lang)} value={subject} onChange={e => setSubject(e.target.value)} />
              <div className="flex flex-col gap-1">
                <label className="text-[12px] uppercase text-text-secondary tracking-[0.5px]">{t('support.description', lang)}</label>
                <textarea
                  className="rounded-xl px-3 py-2 bg-bg-secondary border border-border-strong text-[14px] text-text-primary min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['low', 'normal', 'high', 'urgent'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                      priority === p ? 'bg-accent-blue text-white' : 'bg-bg-secondary border border-border-default text-text-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleCreate}>{t('support.submit', lang)}</Button>
                <Button variant="secondary" onClick={() => setShowCreate(false)}>{t('common.cancel', lang)}</Button>
              </div>
            </div>
          </Card>
        )}

        {selectedTicket && (
          <Card className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-text-primary">{selectedTicket.subject}</h3>
                <p className="text-[12px] text-text-secondary">{new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={statusVariant(selectedTicket.status) as 'info'}>{t(`support.${selectedTicket.status}`, lang)}</Badge>
                <Button variant="ghost" className="!h-8 !text-[12px]" onClick={() => setSelectedTicket(null)}>X</Button>
              </div>
            </div>
            <p className="text-[13px] text-text-secondary mb-4">{selectedTicket.description}</p>
            {selectedTicket.messages && (
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {selectedTicket.messages.map(m => (
                  <div key={m.id} className="p-3 bg-bg-secondary rounded-xl">
                    <p className="text-[12px] font-bold text-text-primary">{m.sender_name}</p>
                    <p className="text-[13px] text-text-secondary mt-1">{m.message}</p>
                    <p className="text-[11px] text-text-disabled mt-1">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder={t('support.messagePlaceholder', lang)}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="primary" className="!h-10" onClick={handleSendMessage}>{t('support.send', lang)}</Button>
            </div>
          </Card>
        )}

        <h2 className="text-[16px] font-bold text-text-primary mb-4">{t('support.yourTickets', lang)}</h2>
        {loading ? (
          <p className="text-text-secondary">{t('common.loading', lang)}</p>
        ) : tickets.length === 0 ? (
          <Card className="text-center py-12"><p className="text-text-secondary">{t('support.noTickets', lang)}</p></Card>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <Card key={ticket.id} hover interactive onClick={() => openTicket(ticket)}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-bold text-text-primary">{ticket.subject}</h3>
                    <p className="text-[12px] text-text-secondary">{new Date(ticket.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[11px] text-text-secondary uppercase">{ticket.priority}</span>
                    <Badge variant={statusVariant(ticket.status) as 'info'}>{t(`support.${ticket.status}`, lang)}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
