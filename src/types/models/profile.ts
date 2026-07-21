export interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'student' | 'developer'
  school_id: string | null
  language: 'en' | 'sw'
  created_at: string
}

export interface ProfileUpdate {
  full_name?: string
  language?: 'en' | 'sw'
  role?: 'admin' | 'student' | 'developer'
}
