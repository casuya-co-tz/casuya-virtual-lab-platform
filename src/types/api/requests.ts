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
  title_sw?: string
  description?: string
  subject: string
  html_code: string
  thumbnail?: string
  is_premium?: boolean
  is_published?: boolean
}

export interface LabUpdateRequest {
  title?: string
  title_sw?: string
  description?: string
  subject?: string
  thumbnail?: string
  is_premium?: boolean
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
