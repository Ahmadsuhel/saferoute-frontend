import { ErrorHandler, Injectable } from '@angular/core'
import { HttpErrorResponse }        from '@angular/common/http'

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      console.error('[HTTP Error]', error.status, error.message)
    } else if (error instanceof Error) {
      console.error('[App Error]', error.message)
    } else {
      console.error('[Unknown Error]', error)
    }
  }
}