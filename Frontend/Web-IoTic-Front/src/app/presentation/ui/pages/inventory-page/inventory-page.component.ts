import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../../services/inventory.service';
import { ElectronicComponent, EstadoAdministrativo, EstadoFisico } from '../../../../models/electronicComponent.model';
import { PrestamoForm, RegistroPrestamo } from '../../../../models/prestamo.model';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-page.component.html',
  styleUrls: ['./inventory-page.component.css']
})
export class InventoryPageComponent implements OnInit {
  components: ElectronicComponent[] = [];
  filtro = { nombre: '', estadoFisico: '', estadoAdministrativo: '' };
  estadosFisicos: EstadoFisico[] = ['Excelente', 'Bueno', 'Dañado'];
  estadosAdministrativos: EstadoAdministrativo[] = ['Disponible', 'Prestado', 'Dado de baja', 'No prestable'];

  // Getter para obtener los componentes filtrados
  get componentesFiltrados(): ElectronicComponent[] {
    return this.components.filter(d => {
      const nombre = (this.filtro?.nombre || '').toLowerCase().trim();
      const estadoFisico = (this.filtro?.estadoFisico || '').trim();
      const estadoAdministrativo = (this.filtro?.estadoAdministrativo || '').trim();

      // Filtro de texto general
      const coincideTexto = !nombre ||
        (d.descripcion?.toLowerCase().includes(nombre) ||
          d.numSerie?.toLowerCase().includes(nombre) ||
          d.ubicacion?.toLowerCase().includes(nombre) ||
          d.observacion?.toLowerCase().includes(nombre));

      // Filtro de estado físico
      const coincideEstadoFisico = !estadoFisico || d.estadoFisico === estadoFisico;

      // Filtro de estado administrativo
      const coincideEstadoAdministrativo = !estadoAdministrativo || d.estadoAdministrativo === estadoAdministrativo;

      return coincideTexto && coincideEstadoFisico && coincideEstadoAdministrativo;
    });
  }

  // Verificar si hay filtros activos
  get hayFiltros(): boolean {
    return !!(this.filtro.nombre || this.filtro.estadoFisico || this.filtro.estadoAdministrativo);
  }

  // Variables para controlar modales de Bootstrap
  showComponentModal = false;
  showLoanModal = false;
  showReportModal = false;

  // Variables para toast
  toastMessage = '';
  showToast = false;
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';

  // Datos para reportes
  reportePrestamos: RegistroPrestamo[] = [];
  componentesNoPrestables: ElectronicComponent[] = [];

  form: ElectronicComponent = this.resetElectronicComponent();
  editando = false;

  prestamoForm: PrestamoForm = {
    electronicComponentId: null,
    usuario: '',
    cantidad: 1,
    tipo: 'PRESTAMO',
    diasPrestamo: 7
  };
  prestamosPendientes: RegistroPrestamo[] = [];

  constructor(private inventoryService: InventoryService) { }

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
    this.inventoryService.getElectronicComponents().subscribe({
      next: data => this.components = data,
      error: err => {
        console.error('Error al cargar:', err);
        this.mostrarToast('Error al cargar los componentes', 'error');
      }
    });
  }

  // ==================== MÉTODOS DE MODALES ====================

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
      tipo,
      diasPrestamo: 7
    };

    // Cargar préstamos pendientes usando el servicio unificado
    this.inventoryService.obtenerPrestamosPendientesPorComponente(componente.id).subscribe({
      next: prestamos => this.prestamosPendientes = prestamos,
      error: err => console.error('Error al cargar préstamos pendientes:', err)
    });

    this.showLoanModal = true;
  }

  cerrarPrestamoModal(): void {
    this.showLoanModal = false;
    this.prestamoForm = {
      electronicComponentId: null,
      usuario: '',
      cantidad: 1,
      tipo: 'PRESTAMO',
      diasPrestamo: 7
    };
    this.prestamosPendientes = [];
  }

  // ==================== MÉTODOS DE COMPONENTES ====================

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

  // ==================== MÉTODOS DE PRÉSTAMOS ====================

  procesarPrestamoDevolucion(): void {
    const { tipo } = this.prestamoForm;

    if (tipo === 'PRESTAMO') {
      this.procesarPrestamo();
    } else {
      this.procesarDevolucion();
    }
  }

  private procesarPrestamo(): void {
    if (!this.validarPrestamoForm()) {
      return;
    }

    this.inventoryService.registrarPrestamo(this.prestamoForm).subscribe({
      next: (prestamo) => {
        this.loadElectronicComponents(); // Recargar para reflejar cambios en cantidad
        const mensaje = `Préstamo de ${this.prestamoForm.cantidad} unidad(es) registrado para ${this.prestamoForm.usuario}. Fecha límite: ${prestamo.fechaFinalizacion}`;
        this.mostrarToast(mensaje, 'success');
        this.cerrarPrestamoModal();
      },
      error: err => this.mostrarToast(err.message, 'error')
    });
  }

  private procesarDevolucion(): void {
    if (this.prestamosPendientes.length === 0) {
      this.mostrarToast('No hay préstamos pendientes para este componente', 'info');
      return;
    }

    // Procesar todas las devoluciones pendientes
    const procesamientos = this.prestamosPendientes.map(prestamo =>
      this.inventoryService.marcarDevuelto(prestamo.id)
    );

    let procesados = 0;
    let errores = 0;

    procesamientos.forEach(observable => {
      observable.subscribe({
        next: () => {
          procesados++;
          if (procesados + errores === this.prestamosPendientes.length) {
            if (errores === 0) {
              this.loadElectronicComponents(); // Recargar para reflejar cambios
              this.mostrarToast(`Devolución de ${procesados} préstamo(s) procesada correctamente`, 'success');
              this.cerrarPrestamoModal();
            } else {
              this.mostrarToast(`Devolución parcial: ${procesados} de ${this.prestamosPendientes.length} préstamos procesados`, 'warning');
            }
          }
        },
        error: (err) => {
          console.error('Error al marcar devolución:', err);
          errores++;
          if (procesados + errores === this.prestamosPendientes.length) {
            this.mostrarToast('Error al procesar algunas devoluciones', 'error');
          }
        }
      });
    });
  }

  marcarDevuelto(prestamo: RegistroPrestamo): void {
    this.inventoryService.marcarDevuelto(prestamo.id).subscribe({
      next: () => {
        this.loadElectronicComponents(); // Recargar para reflejar cambios
        this.prestamosPendientes = this.prestamosPendientes.filter(x => x.id !== prestamo.id);
        this.mostrarToast(`Devolución registrada para ${prestamo.usuario}`, 'success');
      },
      error: (err) => {
        console.error('Error marcando devolución:', err);
        this.mostrarToast('No se pudo registrar la devolución', 'error');
      }
    });
  }

  private validarPrestamoForm(): boolean {
    if (!this.prestamoForm.usuario.trim()) {
      this.mostrarToast('Por favor, ingrese el nombre del usuario', 'error');
      return false;
    }

    if (!this.prestamoForm.diasPrestamo || this.prestamoForm.diasPrestamo <= 0) {
      this.mostrarToast('Por favor, ingrese un número válido de días de préstamo', 'error');
      return false;
    }

    const componente = this.components.find(c => c.id === this.prestamoForm.electronicComponentId);
    if (!componente) {
      this.mostrarToast('Componente no encontrado', 'error');
      return false;
    }

    if (!this.puedeSerPrestado(componente)) {
      this.mostrarToast('Este componente no puede ser prestado', 'error');
      return false;
    }

    if (componente.cantidad < this.prestamoForm.cantidad) {
      this.mostrarToast('No hay suficientes unidades disponibles para el préstamo', 'error');
      return false;
    }

    return true;
  }

  // Método para obtener la fecha actual formateada
  getFechaActual(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Método para calcular la fecha límite basada en los días de préstamo
  calcularFechaLimite(): string {
    if (!this.prestamoForm.diasPrestamo) return '';

    const fecha = new Date();
    fecha.setDate(fecha.getDate() + this.prestamoForm.diasPrestamo);
    return fecha.toISOString().slice(0, 10);
  }

  // Método para obtener información del componente actual
  getComponenteActual(): ElectronicComponent | null {
    if (!this.prestamoForm.electronicComponentId) return null;
    return this.components.find(c => c.id === this.prestamoForm.electronicComponentId) || null;
  }
  // ==================== MÉTODOS DE REPORTES ====================

  abrirReporteModal(): void {
    this.inventoryService.obtenerReporteInventario().subscribe({
      next: (reporte) => {
        this.reportePrestamos = reporte.prestamosActivos;
        this.componentesNoPrestables = reporte.componentesNoPrestables;
        this.showReportModal = true;
      },
      error: err => {
        console.error('Error al cargar reporte:', err);
        this.mostrarToast('Error al cargar el reporte', 'error');
      }
    });
  }

  cerrarReporteModal(): void {
    this.showReportModal = false;
    this.reportePrestamos = [];
    this.componentesNoPrestables = [];
  }

  // ==================== MÉTODOS AUXILIARES ====================

  puedeSerPrestado(componente: ElectronicComponent): boolean {
    return componente.estadoAdministrativo !== 'No prestable' &&
      componente.estadoAdministrativo !== 'Dado de baja' &&
      componente.cantidad > 0;
  }

  getMaxCantidadPrestamo(): number {
    if (!this.prestamoForm.electronicComponentId) return 0;
    const componente = this.components.find(c => c.id === this.prestamoForm.electronicComponentId);
    return componente ? componente.cantidad : 0;
  }

  getEstadoPrestamo(prestamo: RegistroPrestamo): string {
    if (prestamo.devuelto) return 'Devuelto';
    if (prestamo.vencido) return 'Vencido';
    return 'En préstamo';
  }

  getClaseEstadoPrestamo(prestamo: RegistroPrestamo): string {
    if (prestamo.devuelto) return 'bg-success';
    if (prestamo.vencido) return 'bg-danger';
    return 'bg-warning';
  }

  getComponenteNombre(componenteId: number): string {
    const componente = this.components.find(c => c.id === componenteId);
    return componente ? componente.descripcion : 'Componente no encontrado';
  }

  // ==================== MÉTODOS DE TOAST ====================

  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = false;

    setTimeout(() => {
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 5000);
    }, 10);
  }

  // ==================== GETTERS COMPUTADOS ====================

  get totalItems(): number {
    return this.components.length;
  }

  get totalDisponibles(): number {
    return this.components.filter(c => c.estadoAdministrativo === 'Disponible').length;
  }

  get totalPrestados(): number {
    return this.components.filter(c => c.estadoAdministrativo === 'Prestado').length;
  }

  get totalBaja(): number {
    return this.components.filter(c => c.estadoAdministrativo === 'Dado de baja').length;
  }

  get totalNoPrestables(): number {
    return this.components.filter(c => c.estadoAdministrativo === 'No prestable').length;
  }

  // ==================== TRACKBY FUNCTIONS ====================

  trackByComponent(index: number, item: ElectronicComponent): number {
    return item.id;
  }

  trackByPrestamo(index: number, item: RegistroPrestamo): number {
    return item.id;
  }
}