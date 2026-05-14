import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr'

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title = 'Success'): void {
    this.toastr.success(message, title, { timeOut: 3000 })
  }

  error(message: string, title = 'Error'): void {
    this.toastr.error(message, title, { timeOut: 4000 })
  }

  warning(message: string, title = 'Warning'): void {
    this.toastr.warning(message, title, { timeOut: 3000 })
  }

  info(message: string, title = 'Info'): void {
    this.toastr.info(message, title, { timeOut: 3000 })
  }
}