export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  fullName: string
}

export interface LabCreateRequest {
  title: string
  title_sw: string
  description?: string
  subject: 'physics' | 'chemistry' | 'biology'
  subtopic_id: string
  html_threejs_code?: string
  is_published?: boolean
}

export interface LabUpdateRequest {
  title?: string
  title_sw?: string
  description?: string
  subject?: string
  subtopic_id?: string
  html_threejs_code?: string
  is_published?: boolean
}

export interface ProgressUpdateRequest {
  lab_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  score?: number
}

export interface UserUpdateRequest {
  id: string
  role: 'admin' | 'student' | 'developer'
}

export interface DeveloperRegisterRequest {
  company_or_school: string
  api_tier?: 'free' | 'premium' | 'enterprise'
}

export interface CredentialCreateRequest {
  scopes?: string[]
}

export interface SettingsUpdateRequest {
  key: string
  value: unknown
}
