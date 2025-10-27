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
  estados: EstadoItem[] = ['Nuevo', 'Operativo', 'En mantenimiento', 'Dado de baja'];
  tipos: TipoItem[] = ['CONSUMIBLE', 'NO_CONSUMIBLE'];

  // modal agregar/editar
  @ViewChild('modal') modalRef!: ElementRef<HTMLDialogElement>;
  editando = false;
  form: Device = this.resetDevice();

  constructor(private inventoryService: InventoryService) {}

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
      descripcion: '',
      categoria: '',
      tipo: 'NO_CONSUMIBLE',
      unidad: 'unidad',
      cantidad: 0,
      valorUnitario: 0,
      valorTotal: 0,
      estado: 'Nuevo',
      ubicacion: '',
      fechaAdquisicion: new Date().toISOString().slice(0, 10),
      documentoSoporte: ''
    };
  }

  // modal
  abrirModal(): void {
    this.editando = false;
    this.form = this.resetDevice();
    this.modalRef.nativeElement.showModal();
  }
  cerrarModal(): void {
    this.modalRef.nativeElement.close();
  }

  editar(d: Device): void {
    this.editando = true;
    this.form = { ...d };
    this.modalRef.nativeElement.showModal();
  }

  guardar(): void {
    // calcular valor total localmente
    this.form.valorTotal = (this.form.cantidad || 0) * (this.form.valorUnitario || 0);

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
    const actualizado: Device = { ...d, estado: 'Dado de baja', cantidad: 0, valorTotal: 0 };
    this.inventoryService.updateDevice(d.id, actualizado).subscribe({
      next: upd => {
        const i = this.devices.findIndex(x => x.id === upd.id);
        if (i !== -1) this.devices[i] = upd;
      },
      error: err => console.error('Error al dar de baja:', err)
    });
  }
}
