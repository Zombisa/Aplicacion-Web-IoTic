import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { MOCK_COMPONENTS } from '../mocks/electronicComponent.mock';
import { ElectronicComponent } from '../models/electronicComponent.model';
import { RegistroPrestamo, PrestamoForm } from '../models/prestamo.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  
  private components: ElectronicComponent[] = [...MOCK_COMPONENTS];
  private prestamos: RegistroPrestamo[] = [];

  constructor() {
    this.cargarPrestamosDesdeLocalStorage();
  }

  // ==================== MÉTODOS DE COMPONENTES ====================

  getElectronicComponents(): Observable<ElectronicComponent[]> {
    return of([...this.components]);
  }

  getElectronicComponent(id: number): Observable<ElectronicComponent | null> {
    const component = this.components.find(d => d.id === id);
    return of(component ? { ...component } : null);
  }

  addElectronicComponent(device: ElectronicComponent): Observable<ElectronicComponent> {
    const id = this.components.length ? Math.max(...this.components.map(d => d.id)) + 1 : 1;
    const nuevo: ElectronicComponent = { ...device, id };
    this.components.push(nuevo);
    return of(nuevo);
  }

  updateElectronicComponent(id: number, updatedElectronicComponent: ElectronicComponent): Observable<ElectronicComponent> {
    const index = this.components.findIndex(d => d.id === id);
    if (index !== -1) {
      this.components[index] = { ...updatedElectronicComponent, id };
      return of(this.components[index]);
    }
    return throwError(() => new Error('Componente no encontrado'));
  }

  deleteElectronicComponent(id: number): Observable<void> {
    this.components = this.components.filter(d => d.id !== id);
    return of(void 0);
  }

  // ==================== MÉTODOS DE PRÉSTAMOS ====================

  registrarPrestamo(form: PrestamoForm): Observable<RegistroPrestamo> {
    const component = this.components.find(c => c.id === form.electronicComponentId);
    
    if (!component) {
      return throwError(() => new Error('Componente no encontrado'));
    }

    const nuevo: RegistroPrestamo = {
      id: Date.now(),
      electronicComponentId: form.electronicComponentId!,
      usuario: form.usuario,
      cantidad: form.cantidad,
      fechaPrestamo: new Date().toISOString().slice(0, 10),
      fechaFinalizacion: this.calcularFechaFinalizacion(form.diasPrestamo || 7),
      diasPrestamo: form.diasPrestamo || 7,
      devuelto: false,
      vencido: false
    };

    this.prestamos.push(nuevo);
    this.persistirPrestamos();
    return of(nuevo);
  }

  marcarDevuelto(prestamoId: number): Observable<RegistroPrestamo> {
    const idx = this.prestamos.findIndex(x => x.id === prestamoId);
    if (idx === -1) {
      return throwError(() => new Error('Préstamo no encontrado'));
    }

    const actualizado = { 
      ...this.prestamos[idx], 
      devuelto: true,
      fechaDevolucion: new Date().toISOString().slice(0, 10)
    };
    
    this.prestamos[idx] = actualizado;
    this.persistirPrestamos();
    return of(actualizado);
  }

  obtenerPrestamosPendientesPorComponente(componentId: number): Observable<RegistroPrestamo[]> {
    const pendientes = this.prestamos.filter(r => 
      r.electronicComponentId === componentId && !r.devuelto
    );
    return of([...pendientes]);
  }

  obtenerTodosLosPrestamos(): Observable<RegistroPrestamo[]> {
    return of([...this.prestamos]);
  }

  obtenerPrestamosActivos(): Observable<RegistroPrestamo[]> {
    const activos = this.prestamos.filter(p => !p.devuelto);
    return of([...activos]);
  }

  // ==================== MÉTODOS DE REPORTES ====================

  obtenerReporteInventario(): Observable<{
    componentes: ElectronicComponent[],
    prestamosActivos: RegistroPrestamo[],
    componentesNoPrestables: ElectronicComponent[]
  }> {
    const prestamosActivos = this.prestamos.filter(p => !p.devuelto);
    const componentesNoPrestables = this.components.filter(c => 
      c.estadoAdministrativo === 'No prestable'
    );

    return of({
      componentes: [...this.components],
      prestamosActivos: [...prestamosActivos],
      componentesNoPrestables: [...componentesNoPrestables]
    });
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private calcularFechaFinalizacion(diasPrestamo: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diasPrestamo);
    return fecha.toISOString().slice(0, 10);
  }

  private cargarPrestamosDesdeLocalStorage(): void {
    try {
      const stored = localStorage.getItem('prestamos');
      if (stored) {
        this.prestamos = JSON.parse(stored);
        this.actualizarEstadosVencimiento();
      }
    } catch (error) {
      console.error('Error al cargar préstamos desde localStorage:', error);
    }
  }

  private actualizarEstadosVencimiento(): void {
    const hoy = new Date().toISOString().slice(0, 10);
    
    this.prestamos.forEach(prestamo => {
      if (!prestamo.devuelto && prestamo.fechaFinalizacion < hoy) {
        prestamo.vencido = true;
      }
    });
    
    this.persistirPrestamos();
  }

  private persistirPrestamos(): void {
    try {
      localStorage.setItem('prestamos', JSON.stringify(this.prestamos));
    } catch (error) {
      console.error('Error al guardar préstamos en localStorage:', error);
    }
  }
}