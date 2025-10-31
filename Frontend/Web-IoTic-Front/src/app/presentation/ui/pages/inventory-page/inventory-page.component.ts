import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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


  form: ElectronicComponent = this.resetElectronicComponent();
  editando = false;

  prestamoForm: PrestamoForm = { electronicComponentId: null, usuario: '', cantidad: 1, tipo: 'PRESTAMO' };
  prestamosPendientes: RegistroPrestamo[] = [];

  toastVisible = false;
  toastMessage = '';

  @ViewChild('modal') modalRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('prestamoModal') prestamoModalRef!: ElementRef<HTMLDialogElement>;

  constructor(private inventoryService: InventoryService, private loanService: LoanService) { }

  ngOnInit(): void {
    this.loadElectronicComponents();
  }

  loadElectronicComponents(): void {
    this.inventoryService.getElectronicComponent().subscribe({
      next: data => this.components = data,
      error: err => console.error('Error al cargar:', err)
    });
  }

  abrirModal(d?: ElectronicComponent): void {
    this.editando = !!d;
    this.form = d ? { ...d } : this.resetElectronicComponent();
    this.modalRef.nativeElement.showModal();
  }

  cerrarModal(): void {
    this.modalRef.nativeElement.close();
  }

  guardar(): void {
    const obs = this.editando
      ? this.inventoryService.updateElectronicComponent(this.form.id, this.form)
      : this.inventoryService.addElectronicComponent(this.form);

    obs.subscribe({
      next: () => {
        this.loadElectronicComponents();
        this.cerrarModal();
      },
      error: err => console.error('Error al guardar:', err)
    });
  }

  eliminar(id: number): void {
    this.inventoryService.deleteElectronicComponent(id).subscribe({
      next: () => this.loadElectronicComponents(),
      error: err => console.error('Error al eliminar:', err)
    });
  }

  abrirPrestamoModal(d: ElectronicComponent, tipo: 'PRESTAMO' | 'DEVOLUCION') {
    this.prestamoForm = { electronicComponentId: d.id, usuario: '', cantidad: 1, tipo };
    this.prestamosPendientes = this.loanService.obtenerPendientesPorComponente(d.id);
    this.prestamoModalRef.nativeElement.showModal();
  }

  procesarPrestamoDevolucion() {
    const { tipo, electronicComponentId, cantidad } = this.prestamoForm;
    const componente = this.components.find(c => c.id === electronicComponentId);
    if (!componente) return;

    if (tipo === 'PRESTAMO') {
      if (componente.cantidad < cantidad) {
        this.mostrarToast('❌ No hay suficientes unidades disponibles');
        return;
      }

      // 🔹 Reducir cantidad
      componente.cantidad -= cantidad;

      this.loanService.registrarPrestamo(this.prestamoForm, componente).subscribe(() => {
        this.actualizarEstadoSegunCantidad(componente);
        this.mostrarToast('✅ Préstamo registrado correctamente');
        this.cerrarPrestamoModal();
      });

    } else {
      //  Procesar devoluciones
      const pendientes = this.loanService.obtenerPendientesPorComponente(componente.id);
      pendientes.forEach(p => this.loanService.marcarDevuelto(p));

      //  Aumentar cantidad
      componente.cantidad += pendientes.reduce((acc, p) => acc + p.cantidad, 0);
      if (componente.cantidad < 0) componente.cantidad = 0; // seguridad

      this.actualizarEstadoSegunCantidad(componente);
      this.mostrarToast('✅ Devolución procesada correctamente');
      this.cerrarPrestamoModal();
    }
  }


  cerrarPrestamoModal() {
    this.prestamoModalRef.nativeElement.close();
  }

  mostrarToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 3000);
  }

  darDeBaja(c: ElectronicComponent): void {
    const actualizado: ElectronicComponent = {
      ...c,
      estadoAdministrativo: 'Dado de baja'
    };

    this.inventoryService.updateElectronicComponent(c.id, actualizado).subscribe({
      next: () => {
        this.loadElectronicComponents();
        this.mostrarToast('📉 Componente dado de baja');
      },
      error: err => console.error('Error al dar de baja:', err)
    });
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


  trackByComponent(index: number, item: ElectronicComponent): number {
    return item.id;
  }

  trackByPrestamo(index: number, item: RegistroPrestamo): number {
    return item.id;
  }

  marcarDevuelto(p: RegistroPrestamo): void {
    this.loanService.marcarDevuelto(p).subscribe({
      next: (updated) => {
        // 1) Actualizar la cantidad del componente
        const compId = (updated as any).electronicComponentId ?? (updated as any).electronicComponentId ?? p.electronicComponentId ?? p.electronicComponentId;
        const componente = this.components.find(c => c.id === compId);
        if (componente) {
          componente.cantidad = (componente.cantidad ?? 0) + (updated.cantidad ?? p.cantidad ?? 0);
          this.actualizarEstadoSegunCantidad(componente);
        }

        // 2) Refrescar lista local (cambiar referencia para disparar change detection)
        this.prestamosPendientes = this.prestamosPendientes.filter(x => x.id !== updated.id);

        this.mostrarToast(`✅ Devolución registrada para ${updated.usuario ?? p.usuario}`);
      },
      error: (err) => {
        console.error('Error marcando devolución:', err);
        this.mostrarToast('❌ No se pudo marcar la devolución');
      }
    });
  }


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

}
