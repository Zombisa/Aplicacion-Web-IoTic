import { APP_INITIALIZER, ApplicationConfig, PLATFORM_ID, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from './environment/environment';
import { withInMemoryScrolling } from '@angular/router';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AppConfigService } from './services/common/app-config.service';

export function initializeAppConfig(configService: AppConfigService) {
  return () => configService.load();
}
export const appConfig: ApplicationConfig = {
 providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    // 
    ...(typeof window !== 'undefined' ? [
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
    ] : []),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
     {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [AppConfigService],
      multi: true
    }
  ]
};