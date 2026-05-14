export type IncidentType =
  | 'ROBBERY' | 'HARASSMENT' | 'VIOLENCE'
  | 'STREET_FIGHT' | 'PROTEST' | 'ACCIDENT'
  | 'SUSPICIOUS' | 'ROAD_BLOCKED' | 'UNSAFE_LIGHTING' | 'OTHER'

export type IncidentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type VoteType = 'UPVOTE' | 'DOWNVOTE' | 'FLAG'

export interface Incident {
  id:           string
  type:         IncidentType
  description?: string
  latitude:     number
  longitude:    number
  address?:     string
  city:         string
  status:       IncidentStatus
  upvotes:      number
  downvotes:    number
  isAnonymous:  boolean
  distanceKm?:  number
  reporter?:    { id: string; name: string }
  createdAt:    string
}

export interface ReportIncidentRequest {
  type:         IncidentType
  description?: string
  latitude:     number
  longitude:    number
  address?:     string
  city:         string
  isAnonymous:  boolean
}