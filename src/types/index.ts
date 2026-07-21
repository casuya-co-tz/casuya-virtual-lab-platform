export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'student' | 'developer'
  school_id: string | null
  language: 'en' | 'sw'
  created_at: string
}

export interface Lab {
  id: string
  subtopic_id: string
  title: string
  title_sw: string
  description: string | null
  subject: 'physics' | 'chemistry' | 'biology'
  html_threejs_code: string | null
  is_published: boolean
  version: number
  security_score: number
  created_by: string | null
  created_at: string
  updated_at: string
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

export interface Subject {
  id: string
  name: string
  name_sw: string
  icon: string | null
  sort_order: number
}
