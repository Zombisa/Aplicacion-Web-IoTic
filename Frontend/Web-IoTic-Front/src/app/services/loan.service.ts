// servicio para toda la gestión de préstamos/devoluciones
import { Injectable } from '@angular/core';
import { RegistroPrestamo, PrestamoForm } from '../models/prestamo.model';
import { ElectronicComponent } from '../models/electronicComponent.model';
import { InventoryService } from './inventory.service';
import { Observable, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private prestamos: RegistroPrestamo[] = [];
  private nextId = 1;

  constructor(private inventoryService: InventoryService) { }

  registrarPrestamo(form: PrestamoForm, component: ElectronicComponent): Observable<RegistroPrestamo> {
    const nuevo: RegistroPrestamo = {
      id: Date.now(),
      electronicComponentId: component.id,
      usuario: form.usuario,
      cantidad: form.cantidad,
      fecha: new Date().toISOString().slice(0, 10),
      devuelto: false,
    };

    this.prestamos.push(nuevo);
    this.persistir();
    return of(nuevo);
  }

  marcarDevuelto(p: RegistroPrestamo): Observable<RegistroPrestamo> {
    const idx = this.prestamos.findIndex(x => x.id === p.id);
    if (idx === -1) return throwError(() => new Error('Préstamo no encontrado'));

    const actualizado = { ...this.prestamos[idx], devuelto: true };
    this.prestamos[idx] = actualizado;
    this.persistir();
    return of(actualizado);
  }

  obtenerPendientesPorComponente(id: number): RegistroPrestamo[] {
    return this.prestamos.filter(r => r.electronicComponentId === id && !r.devuelto);
  }

  obtenerTodos(): RegistroPrestamo[] {
    return this.prestamos;
  }

  private persistir() {
    // opcional: guarda en localStorage si quieres persistencia
    try {
      localStorage.setItem('prestamos', JSON.stringify(this.prestamos));
    } catch {}
  }
}
