'use client'
import { useState, useEffect, useCallback } from 'react'

interface LabListItem {
  id: string
  title: string
  subject: string
  is_premium: boolean
  current_version: number
  updated_at: string
}

interface LabContent extends LabListItem {
  content: any
  title_sw?: string
  description?: string
}

interface SubjectCount {
  subject: string
  count: number
}

interface SearchResult {
  id: string
  title: string
  subject: string
}

interface UseLabsOptions {
  subject?: string
  page?: number
  limit?: number
  autoFetch?: boolean
}

export function useLabs(options?: UseLabsOptions) {
  const { subject, page = 1, limit = 50, autoFetch = true } = options || {}
  const [labs, setLabs] = useState<LabListItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState('')

  const fetchLabs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (subject) params.set('subject', subject)
      const r = await fetch(`/api/labs?${params}`)
      if (!r.ok) throw new Error()
      const json = await r.json()
      setLabs(json.data || [])
      setTotal(json.total || 0)
      setPages(json.pages || 0)
    } catch {
      setError('Failed to fetch labs')
    }
    setLoading(false)
  }, [subject, page, limit])

  useEffect(() => {
    if (autoFetch) fetchLabs()
  }, [autoFetch, fetchLabs])

  return { labs, total, pages, loading, error, refetch: fetchLabs }
}

export function useLab(id: string | null) {
  const [lab, setLab] = useState<LabContent | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')

  const fetchLab = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`/api/labs/${id}`)
      if (!r.ok) {
        setError('Lab not found')
      } else {
        const json = await r.json()
        setLab(json)
      }
    } catch {
      setError('Failed to fetch lab')
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    if (id) fetchLab()
  }, [id, fetchLab])

  return { lab, loading, error, refetch: fetchLab }
}

export function useLabSearch(query: string, subject?: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ q })
      if (subject) params.set('subject', subject)
      const r = await fetch(`/api/search?${params}`)
      if (!r.ok) throw new Error()
      const json = await r.json()
      setResults(json.results || [])
    } catch {
      setError('Search failed')
    }
    setLoading(false)
  }, [subject])

  useEffect(() => {
    if (query) search(query)
  }, [query, search])

  return { results, loading, error, search }
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/subjects')
      .then(r => r.ok ? r.json() : [])
      .then(data => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { subjects, loading }
}
