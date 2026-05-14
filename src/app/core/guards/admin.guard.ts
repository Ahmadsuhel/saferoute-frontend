import { inject }        from '@angular/core'
import { Router }        from '@angular/router'
import { CanActivateFn } from '@angular/router'
import { StorageService } from '../services/storage.service'
import { getTokenRole }   from '../utils/token.util'

export const adminGuard: CanActivateFn = () => {
  const storage = inject(StorageService)
  const router  = inject(Router)
  const token   = storage.get<string>('accessToken')
  const role    = token ? getTokenRole(token) : null
  if (role !== 'ADMIN') {
    router.navigate(['/home'])
    return false
  }
  return true
}