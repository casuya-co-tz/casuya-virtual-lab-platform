export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'student' | 'developer'
          school_id: string | null
          language: 'en' | 'sw'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'admin' | 'student' | 'developer'
          school_id?: string | null
          language?: 'en' | 'sw'
        }
        Update: {
          full_name?: string
          role?: 'admin' | 'student' | 'developer'
          school_id?: string | null
          language?: 'en' | 'sw'
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          name_sw: string
          icon: string | null
          sort_order: number
        }
      }
      topics: {
        Row: {
          id: string
          subject_id: string
          title: string
          title_sw: string
          sort_order: number
        }
      }
      subtopics: {
        Row: {
          id: string
          topic_id: string
          title: string
          title_sw: string
          sort_order: number
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          billing_contact_email: string | null
          created_at: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          school_id: string | null
          tier: 'free' | 'premium' | 'enterprise'
          status: 'active' | 'expired' | 'pending' | 'cancelled'
          storage_used_bytes: number
          storage_limit_bytes: number
          provider: string | null
          transaction_id: string | null
          amount: number | null
          currency: string
          expires_at: string | null
          created_at: string
        }
      }
      labs: {
        Row: {
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
      }
      lab_progress: {
        Row: {
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
      }
      audit_log: {
        Row: {
          id: number
          actor_id: string | null
          action: string
          target_type: string
          target_id: string
          old_value: Record<string, unknown> | null
          new_value: Record<string, unknown> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
      }
      platform_settings: {
        Row: {
          key: string
          value: unknown
          updated_by: string | null
          updated_at: string
        }
      }
      documentation: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          category: string
          published: boolean
          updated_at: string
        }
      }
    }
  }
}
