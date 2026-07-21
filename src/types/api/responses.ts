import type { Profile } from '../models/profile'
import type { Lab, LabProgress } from '../models/lab'

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  user: Profile
  session?: {
    access_token: string
    expires_at: number
  }
}

export interface LabsResponse extends Array<LabWithRelations> {}

export interface LabWithRelations extends Lab {
  subject_name: string | null
  subtopic_title: string | null
  topic_title: string | null
  creator_name: string | null
}

export interface ProgressResponse extends Array<LabProgress> {}

export interface StatsResponse {
  total_students: number
  total_labs: number
  published_labs: number
  total_progress: number
  completed_labs: number
  avg_score: number
}

export interface AuditLogResponse {
  logs: Array<{
    id: string
    user_id: string
    action: string
    entity_type: string
    entity_id: string
    old_values: Record<string, unknown> | null
    new_values: Record<string, unknown> | null
    ip_address: string | null
    created_at: string
    full_name?: string
  }>
}

export interface SubjectTreeResponse {
  id: string
  name: string
  name_sw: string
  icon: string | null
  topics: Array<{
    id: string
    title: string
    title_sw: string
    subtopics: Array<{
      id: string
      title: string
      title_sw: string
    }>
  }>
}

export interface ApiKeyResponse {
  id: string
  public_token: string
  scopes: string[]
  is_active: boolean
  request_count: number
  last_used_at: string | null
  created_at: string
}
