import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterInventoryPipe } from '../../../../pipes/filter-inventory-pipe';
import { InventoryService } from '../../../../services/inventory.service';
import { ElectronicComponent, EstadoAdministrativo, EstadoFisico } from '../../../../models/electronicComponent.model';
import { LoanService } from '../../../../services/loan.service';
import { PrestamoForm, RegistroPrestamo } from '../../../../models/prestamo.model';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterInventoryPipe],
  templateUrl: './inventory-page.component.html',
  styleUrls: ['./inventory-page.component.css']
})
export class InventoryPageComponent implements OnInit {
  components: ElectronicComponent[] = [];
  filtro = { nombre: '', estado: '' };
  estadosFisicos: EstadoFisico[] = ['Excelente', 'Bueno', 'Regular', 'Defectuoso', 'Dañado', 'En mantenimiento', 'Obsoleto'];
  estadosAdministrativos: EstadoAdministrativo[] = ['Disponible', 'Prestado', 'Reservado', 'Asignado', 'Dado de baja'];

  // Variables para controlar modales de Bootstrap
  showComponentModal = false;
  showLoanModal = false;
  
  // Variables para toast
  toastMessage = '';
  showToast = false;
  toastType: 'success' | 'error' | 'info' = 'info';

  form: ElectronicComponent = this.resetElectronicComponent();
  editando = false;

  prestamoForm: PrestamoForm = { electronicComponentId: null, usuario: '', cantidad: 1, tipo: 'PRESTAMO' };
  prestamosPendientes: RegistroPrestamo[] = [];

  constructor(
    private inventoryService: InventoryService, 
    private loanService: LoanService
  ) { }

  ngOnInit(): void {
    this.loadElectronicComponents();
  }

  resetElectronicComponent(): ElectronicComponent {
    return {
      id: 0,
      numSerie: '',
      descripcion: '',
      cantidad: 0,
      ubicacion: '',
      estadoFisico: 'Excelente',
      estadoAdministrativo: 'Disponible',
      observacion: '',
      imagenArticulo: '',
    };
  }

  loadElectronicComponents(): void {
    this.inventoryService.getElectronicComponent().subscribe({
      next: data => this.components = data,
      error: err => {
        console.error('Error al cargar:', err);
        this.mostrarToast('Error al cargar los componentes', 'error');
      }
    });
  }

  // Métodos para modales
  abrirModal(componente?: ElectronicComponent): void {
    this.editando = !!componente;
    this.form = componente ? { ...componente } : this.resetElectronicComponent();
    this.showComponentModal = true;
  }

  cerrarModal(): void {
    this.showComponentModal = false;
    this.form = this.resetElectronicComponent();
    this.editando = false;
  }

  abrirPrestamoModal(componente: ElectronicComponent, tipo: 'PRESTAMO' | 'DEVOLUCION'): void {
    this.prestamoForm = { 
      electronicComponentId: componente.id, 
      usuario: '', 
      cantidad: 1, 
      tipo 
    };
    this.prestamosPendientes = this.loanService.obtenerPendientesPorComponente(componente.id);
    this.showLoanModal = true;
  }

  cerrarPrestamoModal(): void {
    this.showLoanModal = false;
    this.prestamoForm = { electronicComponentId: null, usuario: '', cantidad: 1, tipo: 'PRESTAMO' };
    this.prestamosPendientes = [];
  }

  // Método para obtener la cantidad máxima disponible para préstamo
  getMaxCantidadPrestamo(): number {
    if (!this.prestamoForm.electronicComponentId) return 0;
    const componente = this.components.find(c => c.id === this.prestamoForm.electronicComponentId);
    return componente ? componente.cantidad : 0;
  }

  // Métodos de guardado
  guardar(): void {
    if (!this.validarFormulario()) {
      this.mostrarToast('Por favor, complete todos los campos requeridos', 'error');
      return;
    }

    const obs = this.editando
      ? this.inventoryService.updateElectronicComponent(this.form.id, this.form)
      : this.inventoryService.addElectronicComponent(this.form);

    obs.subscribe({
      next: () => {
        this.loadElectronicComponents();
        this.cerrarModal();
        this.mostrarToast(
          `Componente ${this.editando ? 'actualizado' : 'agregado'} correctamente`, 
          'success'
        );
      },
      error: err => {
        console.error('Error al guardar:', err);
        this.mostrarToast('Error al guardar el componente', 'error');
      }
    });
  }

  private validarFormulario(): boolean {
    return !!(this.form.numSerie && this.form.descripcion && this.form.cantidad >= 0);
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este componente?')) {
      this.inventoryService.deleteElectronicComponent(id).subscribe({
        next: () => {
          this.loadElectronicComponents();
          this.mostrarToast('Componente eliminado correctamente', 'success');
        },
        error: err => {
          console.error('Error al eliminar:', err);
          this.mostrarToast('Error al eliminar el componente', 'error');
        }
      });
    }
  }

  // Métodos de préstamos y devoluciones
  procesarPrestamoDevolucion(): void {
    const { tipo, electronicComponentId, cantidad, usuario } = this.prestamoForm;
    const componente = this.components.find(c => c.id === electronicComponentId);
    
    if (!componente) {
      this.mostrarToast('Componente no encontrado', 'error');
      return;
    }

    if (tipo === 'PRESTAMO') {
      this.procesarPrestamo(componente);
    } else {
      this.procesarDevolucion(componente);
    }
  }

  private procesarPrestamo(componente: ElectronicComponent): void {
    if (componente.cantidad < this.prestamoForm.cantidad) {
      this.mostrarToast('No hay suficientes unidades disponibles', 'error');
      return;
    }

    if (!this.prestamoForm.usuario.trim()) {
      this.mostrarToast('Por favor, ingrese el nombre del usuario', 'error');
      return;
    }

    componente.cantidad -= this.prestamoForm.cantidad;

    this.loanService.registrarPrestamo(this.prestamoForm, componente).subscribe({
      next: () => {
        this.actualizarEstadoSegunCantidad(componente);
        this.mostrarToast('Préstamo registrado correctamente', 'success');
        this.cerrarPrestamoModal();
      },
      error: err => {
        console.error('Error al registrar préstamo:', err);
        this.mostrarToast('Error al registrar el préstamo', 'error');
        // Revertir cambios en caso de error
        componente.cantidad += this.prestamoForm.cantidad;
      }
    });
  }

  private procesarDevolucion(componente: ElectronicComponent): void {
    const pendientes = this.loanService.obtenerPendientesPorComponente(componente.id);
    
    if (pendientes.length === 0) {
      this.mostrarToast('No hay préstamos pendientes para este componente', 'info');
      return;
    }

    pendientes.forEach(p => this.loanService.marcarDevuelto(p));

    const cantidadTotal = pendientes.reduce((acc, p) => acc + p.cantidad, 0);
    componente.cantidad += cantidadTotal;

    this.actualizarEstadoSegunCantidad(componente);
    this.mostrarToast('Devolución procesada correctamente', 'success');
    this.cerrarPrestamoModal();
  }

  marcarDevuelto(prestamo: RegistroPrestamo): void {
    this.loanService.marcarDevuelto(prestamo).subscribe({
      next: (updated) => {
        const compId = (updated as any).electronicComponentId ?? prestamo.electronicComponentId;
        const componente = this.components.find(c => c.id === compId);
        
        if (componente) {
          componente.cantidad = (componente.cantidad ?? 0) + (updated.cantidad ?? prestamo.cantidad ?? 0);
          this.actualizarEstadoSegunCantidad(componente);
        }

        this.prestamosPendientes = this.prestamosPendientes.filter(x => x.id !== updated.id);
        this.mostrarToast(`Devolución registrada para ${updated.usuario ?? prestamo.usuario}`, 'success');
      },
      error: (err) => {
        console.error('Error marcando devolución:', err);
        this.mostrarToast('No se pudo marcar la devolución', 'error');
      }
    });
  }

  darDeBaja(componente: ElectronicComponent): void {
    if (confirm('¿Está seguro de que desea dar de baja este componente?')) {
      const actualizado: ElectronicComponent = {
        ...componente,
        estadoAdministrativo: 'Dado de baja'
      };

      this.inventoryService.updateElectronicComponent(componente.id, actualizado).subscribe({
        next: () => {
          this.loadElectronicComponents();
          this.mostrarToast('Componente dado de baja correctamente', 'success');
        },
        error: err => {
          console.error('Error al dar de baja:', err);
          this.mostrarToast('Error al dar de baja el componente', 'error');
        }
      });
    }
  }

  private actualizarEstadoSegunCantidad(componente: ElectronicComponent): void {
    if (componente.cantidad === 0) {
      componente.estadoAdministrativo = 'Prestado';
    } else {
      componente.estadoAdministrativo = 'Disponible';
    }

    this.inventoryService.updateElectronicComponent(componente.id, componente).subscribe({
      next: () => this.loadElectronicComponents(),
      error: err => console.error('Error al actualizar estado:', err)
    });
  }

  // Métodos para toast
  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'info' = 'info'): void {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  // Getters para las propiedades computadas
  get totalItems(): number {
    return this.components.length;
  }

  get totalDisponibles(): number {
    return this.components.filter(c => c.estadoAdministrativo === 'Disponible').length;
  }

  get totalPrestados(): number {
    return this.components.filter(
      c => c.estadoAdministrativo === 'Prestado' || c.estadoAdministrativo === 'Asignado'
    ).length;
  }

  get totalBaja(): number {
    return this.components.filter(c => c.estadoAdministrativo === 'Dado de baja').length;
  }

  // TrackBy functions
  trackByComponent(index: number, item: ElectronicComponent): number {
    return item.id;
  }

  trackByPrestamo(index: number, item: RegistroPrestamo): number {
    return item.id;
  }
}