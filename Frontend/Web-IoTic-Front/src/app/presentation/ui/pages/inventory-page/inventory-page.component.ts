import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Device, EstadoItem, InventoryService, TipoItem } from '../../../../services/inventory.service';
import { FilterInventoryPipe } from '../../../../pipes/filter-inventory-pipe';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterInventoryPipe],
  templateUrl: './inventory-page.component.html',
  styleUrls: ['./inventory-page.component.css']
})
export class InventoryPageComponent implements OnInit {
  devices: Device[] = [];

  // filtros
  filtro = { nombre: '', categoria: '', estado: '' };
  categorias = ['Microcontrolador', 'Sensor', 'Actuador', 'Cable', 'Módulo', 'Kit'];
  estados: EstadoItem[] = ['Prestado', 'Disponible', 'Dado de baja'];
  tipos: TipoItem[] = ['CONSUMIBLE', 'NO_CONSUMIBLE'];

  // modal agregar/editar
  @ViewChild('modal') modalRef!: ElementRef<HTMLDialogElement>;
  editando = false;
  form: Device = this.resetDevice();

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.loadDevices();
  }

  // cargar
  loadDevices(): void {
    this.inventoryService.getDevices().subscribe({
      next: data => (this.devices = data),
      error: err => console.error('Error al cargar dispositivos:', err)
    });
  }

  // helpers
  resetDevice(): Device {
    return {
      id: 0,
      referencia: '',
      nombre: '',
      tipo: 'NO_CONSUMIBLE',
      cantidad: 0,
      estado: 'Prestado',
      fechaAdquisicion: new Date().toISOString().slice(0, 10),
    };
  }

  // modal
  abrirModal(): void {
    this.editando = false;
    this.form = this.resetDevice();
    const modal = document.querySelector('dialog') as HTMLDialogElement;
    console.log('Modal encontrado:', modal);
    if (modal) {
    modal.showModal();
    console.log('Intentando abrir modal...');
  } else {
    console.warn('❌ No se encontró el elemento <dialog>');
  }
  }

  cerrarModal(): void {
    const modal = document.querySelector('dialog') as HTMLDialogElement;
    if (modal && modal.open) modal.close();
  }

  editar(d: Device): void {
    this.editando = true;
    this.form = { ...d };
    const modal = document.querySelector('dialog') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  guardar(): void {

    if (this.editando) {
      this.inventoryService.updateDevice(this.form.id, this.form).subscribe({
        next: upd => {
          const i = this.devices.findIndex(x => x.id === upd.id);
          if (i !== -1) this.devices[i] = upd;
          this.cerrarModal();
        },
        error: err => console.error('Error al actualizar:', err)
      });
    } else {
      this.inventoryService.addDevice(this.form).subscribe({
        next: nuevo => {
          this.devices.push(nuevo);
          this.cerrarModal();
        },
        error: err => console.error('Error al agregar:', err)
      });
    }
  }

  eliminar(id: number): void {
    this.inventoryService.deleteDevice(id).subscribe({
      next: () => (this.devices = this.devices.filter(d => d.id !== id)),
      error: err => console.error('Error al eliminar:', err)
    });
  }

  registrarBaja(d: Device): void {
    // versión simple: marcar como "Dado de baja" y cantidad=0
    const actualizado: Device = { ...d, estado: 'Dado de baja', cantidad: 0};
    this.inventoryService.updateDevice(d.id, actualizado).subscribe({
      next: upd => {
        const i = this.devices.findIndex(x => x.id === upd.id);
        if (i !== -1) this.devices[i] = upd;
      },
      error: err => console.error('Error al dar de baja:', err)
    });
  }

  // 🔹 Resumen general
  get totalItems(): number {
    return this.devices.length;
  }

  get totalDisponibles(): number {
    return this.devices.filter(d => d.estado === 'Disponible').length;
  }

  get totalPrestados(): number {
    return this.devices.filter(d => d.estado === 'Prestado').length; // cuando haya préstamos
  }

  get totalBaja(): number {
    return this.devices.filter(d => d.estado === 'Dado de baja').length;
  }

  // 🔹 Registro de préstamo simple
  registrarPrestamo(d: Device): void {
    if (d.cantidad <= 0) {
      alert('No hay unidades disponibles para préstamo.');
      return;
    }
    const cantidadPrestada = prompt(`¿Cuántas unidades de "${d.nombre}" deseas prestar?`, '1');
    const n = Number(cantidadPrestada);

    if (!isNaN(n) && n > 0 && n <= d.cantidad) {
      const actualizado: Device = {
        ...d,
        cantidad: d.cantidad - n,
        estado: d.cantidad - n > 0 ? d.estado : 'Prestado'
      };
      this.inventoryService.updateDevice(d.id, actualizado).subscribe({
        next: upd => {
          const i = this.devices.findIndex(x => x.id === upd.id);
          if (i !== -1) this.devices[i] = upd;
        }
      });
    }
  }

  // 🔹 Devolución
  registrarDevolucion(d: Device): void {
    const cantidadDevuelta = prompt(`¿Cuántas unidades de "${d.nombre}" devuelves?`, '1');
    const n = Number(cantidadDevuelta);

    if (!isNaN(n) && n > 0) {
      const actualizado: Device = {
        ...d,
        cantidad: d.cantidad + n,
        estado: 'Disponible'
      };
      this.inventoryService.updateDevice(d.id, actualizado).subscribe({
        next: upd => {
          const i = this.devices.findIndex(x => x.id === upd.id);
          if (i !== -1) this.devices[i] = upd;
        }
      });
    }
  }

}
