import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
   // Este es el "interruptor" que controla si se muestra o no el loading
  // BehaviorSubject guarda un valor (true/false) y avisa cuando cambia
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Este Observable es el que escuchan los componentes
  // Cuando cambia de false a true, muestra el loading
  // Cuando cambia de true a false, oculta el loading
  public loading$ = this.loadingSubject.asObservable();

  // Método para MOSTRAR el loading
  show() {
    this.loadingSubject.next(true); // Cambia el valor a true
  }

  // Método para OCULTAR el loading
  hide() {
    this.loadingSubject.next(false); // Cambia el valor a false
  }
}
