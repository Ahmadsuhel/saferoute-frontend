export interface ApiResponse<T> {
  success:   boolean
  message:   string
  data:      T
  timestamp: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data:    T[]
  pagination: {
    total:      number
    page:       number
    limit:      number
    totalPages: number
    hasNext:    boolean
    hasPrev:    boolean
  }
  timestamp: string
}