import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InactivityWarningComponent } from './presentation/ui/components/inactivity-warning/inactivity-warning.component';
import { Footer } from './presentation/ui/templates/footer/footer';
import { InactivityService } from './services/inactivity.service';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InactivityWarningComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Web-IoTic-Front');
  
  private inactivityService = inject(InactivityService);
  private authService = inject(AuthService);
  private authSubscription?: Subscription;

  ngOnInit(): void {
    // Suscribirse a cambios en el estado de autenticación
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        // Si hay usuario autenticado, iniciar seguimiento de inactividad
        this.inactivityService.startTracking();
      } else {
        // Si no hay usuario, detener seguimiento
        this.inactivityService.stopTracking();
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción al destruir el componente
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.inactivityService.stopTracking();
  }
}
