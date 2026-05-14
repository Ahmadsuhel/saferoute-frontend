import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  id:           string
  email:        string
  role:         string
  name:         string
  tokenVersion: number
  exp:          number
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token)
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded) return true
  return decoded.exp * 1000 < Date.now()
}

export function getTokenRole(token: string): string | null {
  const decoded = decodeToken(token)
  return decoded?.role || null
}

export function getTokenUser(token: string): JwtPayload | null {
  return decodeToken(token)
}