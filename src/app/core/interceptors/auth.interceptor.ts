import { HttpInterceptorFn } from '@angular/common/http'
import { inject }            from '@angular/core'
import { catchError, switchMap, throwError } from 'rxjs'
import { Router }         from '@angular/router'
import { AuthService }    from '../services/auth.service'
import { StorageService } from '../services/storage.service'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService)
  const auth    = inject(AuthService)
  const router  = inject(Router)

  const token   = storage.get<string>('accessToken')
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        const refreshToken = storage.get<string>('refreshToken')
        if (refreshToken) {
          return auth.refreshToken(refreshToken).pipe(
            switchMap(res => {
              storage.set('accessToken',  res.data.accessToken)
              storage.set('refreshToken', res.data.refreshToken)
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.data.accessToken}` }
              })
              return next(retryReq)
            }),
            catchError(() => {
              auth.clearSession()
              router.navigate(['/auth/login'])
              return throwError(() => error)
            })
          )
        }
        auth.clearSession()
        router.navigate(['/auth/login'])
      }
      return throwError(() => error)
    })
  )
}