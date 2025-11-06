import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

// Configuración específica para el servidor (sin Firebase)
const serverConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

export const config = serverConfig;
