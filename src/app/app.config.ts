import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync }          from '@angular/platform-browser/animations/async'
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideToastr } from 'ngx-toastr';
import { GlobalErrorHandler } from './core/exceptions/global-error-handler';

export const appConfig: ApplicationConfig = {
 providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAnimationsAsync(),
    provideToastr({
      timeOut:           3000,
      positionClass:     'toast-top-right',
      preventDuplicates: true,
    }),
    {
      provide:  ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};
