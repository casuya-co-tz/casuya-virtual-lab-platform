'use client'
import { useState, useEffect } from 'react'
import type { Lab } from '@/types'

interface UseLabsOptions {
  subject?: string
  published?: boolean
}

export function useLabs(options?: UseLabsOptions) {
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (options?.subject) params.set('subject', options.subject)
    if (options?.published !== undefined) params.set('published', String(options.published))

    fetch(`/api/labs?${params}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch labs')
        return r.json()
      })
      .then(data => { setLabs(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [options?.subject, options?.published])

  return { labs, loading, error, setLabs }
}
