const LAB_SERVICE_URL = process.env.LAB_CONTENT_SERVICE_URL || 'http://localhost:3100'
const LAB_SERVICE_KEY = process.env.LAB_CONTENT_API_KEY || 'lab-content-secret-key-change-in-production'

interface LabServiceResponse {
  ok: boolean
  status: number
  data: any
}

async function request(
  method: string,
  path: string,
  body?: any,
): Promise<LabServiceResponse> {
  const url = `${LAB_SERVICE_URL}${path}`
  const headers: Record<string, string> = {
    'x-api-key': LAB_SERVICE_KEY,
    'Content-Type': 'application/json',
  }

  const opts: RequestInit = { method, headers }

  if (body && (method === 'POST' || method === 'PUT')) {
    opts.body = JSON.stringify(body)
  }

  try {
    const res = await fetch(url, opts)
    const text = await res.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
    return { ok: res.ok, status: res.status, data }
  } catch (err) {
    console.error(`Lab Content Service error: ${method} ${path}`, err)
    return { ok: false, status: 502, data: { error: 'Lab Content Service unavailable' } }
  }
}

export interface LabContent {
  id: string
  title: string
  title_sw: string | null
  subject: string
  description: string | null
  description_sw: string | null
  thumbnail: string | null
  is_premium: boolean
  current_version: number
  updated_at: string
  html_code: string
  scoring_config: any
  subtopic_id?: string
}

export interface LabListItem {
  id: string
  title: string
  title_sw: string | null
  subject: string
  description: string | null
  description_sw: string | null
  is_premium: boolean
  is_published?: boolean
  current_version: number
  updated_at: string
}

export interface SubjectCount {
  subject: string
  lab_count: string
}

export interface SearchResult {
  id: string
  title: string
  title_sw: string | null
  subject: string
  description: string | null
  description_sw: string | null
  is_premium: boolean
  current_version: number
  updated_at: string
  rank: number
}

export async function getLabs(filters?: { subject?: string; thumbnail?: string; page?: number; limit?: number }): Promise<{ data: LabListItem[]; total: number; page: number; limit: number; pages: number }> {
  const params = new URLSearchParams()
  if (filters?.subject) params.set('subject', filters.subject)
  if (filters?.thumbnail) params.set('thumbnail', filters.thumbnail)
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.limit) params.set('limit', String(filters.limit))
  const qs = params.toString()
  const res = await request('GET', `/api/casuya/labs${qs ? '?' + qs : ''}`)
  if (res.ok && res.data?.data) return res.data
  return { data: [], total: 0, page: 1, limit: 50, pages: 0 }
}

export async function getLab(id: string): Promise<LabContent | null> {
  const res = await request('GET', `/api/casuya/labs/${id}`)
  return res.ok ? res.data : null
}

export async function getSubjects(): Promise<SubjectCount[]> {
  const res = await request('GET', '/api/casuya/subjects')
  return res.ok ? res.data : []
}

export async function searchLabs(q: string, subject?: string, thumbnail?: string): Promise<{ query: string; results: SearchResult[] }> {
  const params = new URLSearchParams({ q })
  if (subject) params.set('subject', subject)
  if (thumbnail) params.set('thumbnail', thumbnail)
  const res = await request('GET', `/api/casuya/search?${params.toString()}`)
  return res.ok ? res.data : { query: q, results: [] }
}

export async function getAnalytics(): Promise<any[]> {
  const res = await request('GET', '/api/casuya/analytics')
  return res.ok ? res.data : []
}

export async function createLab(data: {
  title: string
  title_sw?: string
  subject: string
  description?: string
  description_sw?: string
  thumbnail?: string
  html_code: string
  subtopic_id?: string
  is_premium?: boolean
  scoring_config?: any
}): Promise<LabContent | null> {
  const res = await request('POST', '/api/casuya/labs', data)
  return res.ok ? res.data : null
}

export async function updateLab(id: string, data: Record<string, unknown>): Promise<LabContent | null> {
  const res = await request('PUT', `/api/casuya/labs/${id}`, data)
  return res.ok ? res.data : null
}

export async function deleteLab(id: string): Promise<boolean> {
  const res = await request('DELETE', `/api/casuya/labs/${id}`)
  return res.ok
}

export async function getLabVersions(id: string): Promise<any[]> {
  const res = await request('GET', `/api/casuya/labs/${id}/versions`)
  return res.ok ? res.data : []
}

export async function createLabVersion(id: string, data: {
  html_code: string
  scoring_config?: any
  changelog?: string
}): Promise<any | null> {
  const res = await request('POST', `/api/casuya/labs/${id}/versions`, data)
  return res.ok ? res.data : null
}

export async function isServiceAvailable(): Promise<boolean> {
  const res = await request('GET', '/api/health')
  return res.ok && res.data?.status === 'ok'
}

export async function duplicateLab(id: string, title?: string): Promise<LabContent | null> {
  const res = await request('POST', `/api/casuya/labs/${id}/duplicate`, title ? { title } : undefined)
  return res.ok ? res.data : null
}

export interface AnalyticsTimeseriesEntry {
  date: string
  access_count: string
}

export interface TopLabEntry {
  id: string
  title: string
  subject: string
  access_count: string
}

export async function getAnalyticsTimeseries(): Promise<AnalyticsTimeseriesEntry[]> {
  const res = await request('GET', '/api/casuya/analytics/timeseries')
  return res.ok ? res.data : []
}

export async function getTopLabs(): Promise<TopLabEntry[]> {
  const res = await request('GET', '/api/casuya/analytics/top-labs')
  return res.ok ? res.data : []
}
