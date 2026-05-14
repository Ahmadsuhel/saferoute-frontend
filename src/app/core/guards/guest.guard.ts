import { inject }        from '@angular/core'
import { Router }        from '@angular/router'
import { CanActivateFn } from '@angular/router'
import { StorageService } from '../services/storage.service'
import { isTokenExpired } from '../utils/token.util'

export const guestGuard: CanActivateFn = () => {
  const storage = inject(StorageService)
  const router  = inject(Router)
  const token   = storage.get<string>('accessToken')
  if (token && !isTokenExpired(token)) {
    router.navigate(['/home'])
    return false
  }
  return true
}