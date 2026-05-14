export type RiskLevel = 'SAFE' | 'CAUTION' | 'DANGER'

export interface SafeRoute {
  routeIndex:  number
  distance:    number
  duration:    number
  safetyScore: number
  riskLevel:   RiskLevel
  color:       'green' | 'yellow' | 'red'
  path:        GeoJSON
  isSafest:    boolean
  isFastest:   boolean
}

export interface RouteCalculateRequest {
  sourceLat:    number
  sourceLng:    number
  sourceAddr?:  string
  destLat:      number
  destLng:      number
  destAddr?:    string
  city?:        string
}

export interface RouteResponse {
  routeId:   string
  routes:    SafeRoute[]
  incidents: number
  summary: {
    safestRoute:          SafeRoute
    fastestRoute:         SafeRoute
    totalIncidentsNearby: number
    incidentTypes:        string[]
  }
}

interface GeoJSON {
  type:        string
  coordinates: number[][]
}