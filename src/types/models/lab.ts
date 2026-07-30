export interface Lab {
  id: string
  title: string
  title_sw: string
  description: string | null
  subject: string
  html_code: string | null
  thumbnail: string | null
  is_published: boolean
  is_premium: boolean
  current_version: number
  created_at: string
  updated_at: string
}

export interface LabWithRelations extends Lab {
  subject_name: string | null
}

export interface LabCreate {
  title: string
  title_sw?: string
  description?: string
  subject: string
  html_code: string
  is_premium?: boolean
  is_published?: boolean
}

export interface LabProgress {
  id: string
  student_id: string
  lab_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  score: number
  completion_data: Record<string, unknown> | null
  sync_version: number
  last_server_ts: string | null
  started_at: string | null
  completed_at: string | null
}
