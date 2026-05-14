import { HttpInterceptorFn } from '@angular/common/http'
import { inject }            from '@angular/core'
import { catchError, throwError } from 'rxjs'
import { NotificationService }   from '../services/notification.service'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService)

  return next(req).pipe(
    catchError(error => {
      const msg = error.error?.message || 'Something went wrong'
      switch (error.status) {
        case 400: notify.error(msg);                     break
        case 401:                                        break
        case 403: notify.error('Access denied');         break
        case 404: notify.error('Not found');             break
        case 409: notify.error(msg);                     break
        case 500: notify.error('Server error');          break
        default:  notify.error(msg)
      }
      return throwError(() => error)
    })
  )
}