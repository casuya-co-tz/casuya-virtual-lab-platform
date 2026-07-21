export interface Subscription {
  id: string
  user_id: string
  school_id: string | null
  tier: 'free' | 'premium' | 'enterprise'
  status: 'active' | 'expired' | 'pending' | 'cancelled'
  storage_used_bytes: number
  storage_limit_bytes: number
  provider: string | null
  transaction_id: string | null
  amount: number | null
  currency: string
  expires_at: string | null
  created_at: string
}

export interface SubscriptionCreate {
  user_id: string
  school_id?: string
  tier: 'free' | 'premium' | 'enterprise'
  provider?: string
  transaction_id?: string
  amount?: number
  currency?: string
}
