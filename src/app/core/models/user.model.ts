export interface User {
  id:          string
  name:        string
  email:       string
  phone?:      string
  city:        string
  role:        'USER' | 'ADMIN' | 'MODERATOR'
  isVerified:  boolean
  createdAt:   string
}

export interface AuthResponse {
  accessToken:  string
  refreshToken: string
  user:         User
}

export interface LoginRequest {
  email:    string
  password: string
}

export interface RegisterRequest {
  name:     string
  email:    string
  phone:    string
  password: string
  city:     string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email:       string
  otp:         string
  newPassword: string
}