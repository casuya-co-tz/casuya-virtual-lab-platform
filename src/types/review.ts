export interface Review {
  id: string
  user_id: string
  rating: number
  review_text: string | null
  is_public: boolean
  helpful_count: number
  not_helpful_count: number
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    role: string
  }
  user_vote?: boolean | null
  is_owner?: boolean
  has_active_subscription?: boolean
}

export interface ReviewReport {
  id: string
  review_id: string
  reporter_id: string
  reason: string
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
  review?: Review
  reporter?: {
    full_name: string
  }
}

export interface CreateReviewInput {
  rating: number
  review_text: string
  is_public?: boolean
}

export interface UpdateReviewInput {
  rating?: number
  review_text?: string
  is_public?: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: 'created_at' | 'rating' | 'helpful_count'
  order?: 'asc' | 'desc'
  min_rating?: number
  status?: 'public' | 'private' | 'all'
}
