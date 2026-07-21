export interface School {
  id: string
  name: string
  billing_contact_email: string | null
  created_at: string
}

export interface SchoolSeat {
  id: string
  school_id: string
  subscription_id: string
  allocated_profile_id: string | null
}
