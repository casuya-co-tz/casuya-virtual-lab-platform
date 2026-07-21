import { Table, Tr, Td } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

interface Subscription {
  id: string
  user_name: string
  school_name: string | null
  tier: string
  status: string
  amount: number
  currency: string
  expires_at: string
  created_at: string
}

interface BillingTableProps {
  subscriptions: Subscription[]
}

const tierVariant: Record<string, 'info' | 'warning' | 'success'> = {
  free: 'info',
  premium: 'warning',
  enterprise: 'success',
}

export function BillingTable({ subscriptions }: BillingTableProps) {
  return (
    <Table headers={['User', 'School', 'Tier', 'Status', 'Amount', 'Expires']}>
      {subscriptions.map(s => (
        <Tr key={s.id}>
          <Td>{s.user_name}</Td>
          <Td>{s.school_name || '—'}</Td>
          <Td><Badge variant={tierVariant[s.tier] || 'neutral'}>{s.tier}</Badge></Td>
          <Td><Badge variant={s.status === 'active' ? 'success' : 'danger'}>{s.status}</Badge></Td>
          <Td>{s.amount > 0 ? `${s.currency} ${s.amount.toLocaleString()}` : 'Free'}</Td>
          <Td>{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : '—'}</Td>
        </Tr>
      ))}
    </Table>
  )
}
