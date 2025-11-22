import { ApplicationConfig, PLATFORM_ID, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { environment } from './environment/environment';
import { withInMemoryScrolling } from '@angular/router';


export const appConfig: ApplicationConfig = {
 providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    // Solo inicializar Firebase en el navegador, no en SSR
    ...(typeof window !== 'undefined' ? [
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
    ] : []),
    provideHttpClient(
      withInterceptorsFromDi() // Si necesitas interceptores clásicos
    ),
  ]
};