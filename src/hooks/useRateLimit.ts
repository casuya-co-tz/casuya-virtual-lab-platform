'use client'
import { useState, useCallback } from 'react'

interface RateLimitState {
  remaining: number
  limit: number
  resetAt: number
}

export function useRateLimit(key: string, limit = 60, windowMs = 60000) {
  const [state, setState] = useState<RateLimitState>({ remaining: limit, limit, resetAt: 0 })

  const check = useCallback(() => {
    const now = Date.now()
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(`rl:${key}`) : null
    let hits: number[] = stored ? JSON.parse(stored) : []

    hits = hits.filter(t => t > now - windowMs)

    if (hits.length >= limit) {
      setState({ remaining: 0, limit, resetAt: hits[0] + windowMs })
      return false
    }

    hits.push(now)
    sessionStorage.setItem(`rl:${key}`, JSON.stringify(hits))
    setState({ remaining: limit - hits.length, limit, resetAt: 0 })
    return true
  }, [key, limit, windowMs])

  return { ...state, check }
}
