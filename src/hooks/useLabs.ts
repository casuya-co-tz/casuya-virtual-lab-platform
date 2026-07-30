'use client'
import { useState, useEffect, useCallback } from 'react'
import { getLabs, getLab, searchLabs, getSubjects, getAnalyticsTimeseries, getTopLabs, duplicateLab } from '@/lib/lab-manager'
import type { LabListItem, LabContent, SubjectCount, SearchResult, AnalyticsTimeseriesEntry, TopLabEntry } from '@/lib/lab-manager'

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
      const result = await getLabs({ subject, page, limit })
      setLabs(result.data)
      setTotal(result.total)
      setPages(result.pages)
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
      const result = await getLab(id)
      if (!result) {
        setError('Lab not found')
      } else {
        setLab(result)
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
      const result = await searchLabs(q, subject)
      setResults(result.results)
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
    getSubjects()
      .then(setSubjects)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { subjects, loading }
}

export function useAnalyticsTimeseries() {
  const [data, setData] = useState<AnalyticsTimeseriesEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getAnalyticsTimeseries()
      setData(result)
    } catch {
      setError('Failed to fetch analytics')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export function useTopLabs() {
  const [data, setData] = useState<TopLabEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTopLabs()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useDuplicateLab() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const duplicate = useCallback(async (id: string, title?: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await duplicateLab(id, title)
      setLoading(false)
      return result
    } catch {
      setError('Failed to duplicate lab')
      setLoading(false)
      return null
    }
  }, [])

  return { duplicate, loading, error }
}
