import { Injectable }  from '@angular/core'
import { HttpClient }  from '@angular/common/http'
import { Router }      from '@angular/router'
import { BehaviorSubject, Observable, tap } from 'rxjs'

import { StorageService } from './storage.service'
import { decodeToken, isTokenExpired } from '../utils/token.util'
import {
  User, AuthResponse,
  LoginRequest, RegisterRequest,
  ForgotPasswordRequest, ResetPasswordRequest
} from '../models/user.model'
import { environment } from '../../../environments/environment'
import { ApiResponse } from '../models/api-response.model'

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = `${environment.apiUrl}/auth`

  private currentUserSubject = new BehaviorSubject<User | null>(null)
  currentUser$ = this.currentUserSubject.asObservable()

  constructor(
    private http:    HttpClient,
    private storage: StorageService,
    private router:  Router
  ) {
    this.loadUserFromStorage()
  }

  private loadUserFromStorage(): void {
    const token = this.storage.get<string>('accessToken')
    if (token && !isTokenExpired(token)) {
      const user = this.storage.get<User>('user')
      this.currentUserSubject.next(user)
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value
  }

  get isLoggedIn(): boolean {
    const token = this.storage.get<string>('accessToken')
    return !!token && !isTokenExpired(token)
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN'
  }

  register(body: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/register`, body).pipe(
      tap(res => this.saveSession(res.data))
    )
  }

  login(body: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/login`, body).pipe(
      tap(res => this.saveSession(res.data))
    )
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.api}/forgot-password`, body)
  }

  resetPassword(body: ResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.api}/reset-password`, body)
  }

  refreshToken(refreshToken: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/refresh`, { refreshToken })
  }

  logout(): void {
    const refreshToken = this.storage.get<string>('refreshToken')
    if (refreshToken) {
      this.http.post(`${this.api}/logout`, { refreshToken }).subscribe()
    }
    this.clearSession()
    this.router.navigate(['/auth/login'])
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.api}/me`).pipe(
      tap(res => {
        this.storage.set('user', res.data)
        this.currentUserSubject.next(res.data)
      })
    )
  }

  private saveSession(data: AuthResponse): void {
    this.storage.set('accessToken',  data.accessToken)
    this.storage.set('refreshToken', data.refreshToken)
    this.storage.set('user',         data.user)
    this.currentUserSubject.next(data.user)
  }

  clearSession(): void {
    this.storage.remove('accessToken')
    this.storage.remove('refreshToken')
    this.storage.remove('user')
    this.currentUserSubject.next(null)
  }

  googleLogin(): void {
    window.location.href = `${environment.apiUrl}/auth/google`
  }
}