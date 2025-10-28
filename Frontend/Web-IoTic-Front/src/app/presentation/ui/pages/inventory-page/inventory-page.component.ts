import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Device, EstadoItem, InventoryService, TipoItem } from '../../../../services/inventory.service';
import { FilterInventoryPipe } from '../../../../pipes/filter-inventory-pipe';

interface PrestamoForm {
  deviceId: number | null;
  usuario: string;
  cantidad: number;
  tipo: 'PRESTAMO' | 'DEVOLUCION';
}

interface RegistroPrestamo {
  id: number;              // identificador del préstamo
  deviceId: number;
  usuario: string;
  cantidad: number;
  fecha: string;
  devuelto: boolean;
}

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterInventoryPipe],
  templateUrl: './inventory-page.component.html',
  styleUrls: ['./inventory-page.component.css']
})

export class InventoryPageComponent implements OnInit {
  devices: Device[] = [];

  registrosPrestamos: RegistroPrestamo[] = [];

  prestamosPendientes: RegistroPrestamo[] = [];

  // filtros
  filtro = { nombre: '', estado: '' };
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
      estado: 'Disponible',
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
    const actualizado: Device = { ...d, estado: 'Dado de baja', cantidad: 0 };
    this.inventoryService.updateDevice(d.id, actualizado).subscribe({
      next: upd => {
        const i = this.devices.findIndex(x => x.id === upd.id);
        if (i !== -1) this.devices[i] = upd;
      },
      error: err => console.error('Error al dar de baja:', err)
    });
  }

  // préstamo/devolución
  @ViewChild('prestamoModal') prestamoModalRef!: ElementRef<HTMLDialogElement>;
  prestamoForm: PrestamoForm = { deviceId: null, usuario: '', cantidad: 1, tipo: 'PRESTAMO' };

  abrirPrestamoModal(d: Device, tipo: 'PRESTAMO' | 'DEVOLUCION') {
    this.prestamoForm = { deviceId: d.id, usuario: '', cantidad: 1, tipo };
    if (tipo === 'DEVOLUCION') {
      this.prestamosPendientes = this.registrosPrestamos.filter(r => r.deviceId === d.id && !r.devuelto);
    }
    this.prestamoModalRef.nativeElement.showModal();
  }

  cerrarPrestamoModal() {
    this.prestamoModalRef.nativeElement.close();
  }

  procesarPrestamoDevolucion() {
    const { deviceId, usuario, cantidad, tipo } = this.prestamoForm;
    if (!deviceId || !usuario.trim() || cantidad <= 0) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const device = this.devices.find(d => d.id === deviceId);
    if (!device) return;

    if (tipo === 'PRESTAMO') {
      if (device.cantidad < cantidad) {
        alert('No hay suficientes unidades disponibles.');
        return;
      }
      const actualizado: Device = {
        ...device,
        cantidad: device.cantidad - cantidad,
        estado: device.cantidad - cantidad > 0 ? 'Disponible' : 'Prestado'
      };
      this.inventoryService.updateDevice(device.id, actualizado).subscribe({
        next: (upd) => {
          const i = this.devices.findIndex(x => x.id === upd.id);
          if (i !== -1) this.devices[i] = upd;
          this.cerrarPrestamoModal();
          const nuevoPrestamo: RegistroPrestamo = {
            id: Date.now(),
            deviceId: device.id,
            usuario,
            cantidad,
            fecha: new Date().toISOString().slice(0, 10),
            devuelto: false
          };
          this.registrosPrestamos.push(nuevoPrestamo);
          this.mostrarToast(`✅ ${tipo === 'PRESTAMO' ? 'Préstamo registrado' : 'Devolución procesada'} correctamente`);
        }
      });
    } else if (tipo === 'DEVOLUCION') {
      const actualizado: Device = {
        ...device,
        cantidad: device.cantidad + cantidad,
        estado: 'Disponible'
      };
      this.inventoryService.updateDevice(device.id, actualizado).subscribe({
        next: (upd) => {
          const i = this.devices.findIndex(x => x.id === upd.id);
          if (i !== -1) this.devices[i] = upd;
          this.cerrarPrestamoModal();
          this.mostrarToast(`✅ ${tipo === 'DEVOLUCION' ? 'Préstamo registrado' : 'Devolución procesada'} correctamente`);
        }
      });
    }
  }

  // Toast
  toastVisible = false;
  toastMessage = '';

  mostrarToast(mensaje: string) {
    this.toastMessage = mensaje;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), 3000); // se oculta a los 3s
  }

  //  Resumen general
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

  getCantidadDisponible(device: Device): number {
    // Usa la cantidad real en el dispositivo (ya actualizada)
    return device.cantidad;
  }

  getCantidadPrestada(device: Device): number {
    // Suma todas las cantidades no devueltas de este dispositivo
    return this.registrosPrestamos
      .filter(p => p.deviceId === device.id && !p.devuelto)
      .reduce((acc, p) => acc + p.cantidad, 0);
  }

  marcarDevuelto(p: RegistroPrestamo) {
    const device = this.devices.find(d => d.id === p.deviceId);
    if (!device) return;

    // actualizar préstamo
    p.devuelto = true;

    // actualizar cantidad en inventario
    const actualizado: Device = {
      ...device,
      cantidad: device.cantidad + p.cantidad,
      estado: 'Disponible'
    };

    this.inventoryService.updateDevice(device.id, actualizado).subscribe({
      next: (upd) => {
        const i = this.devices.findIndex(x => x.id === upd.id);
        if (i !== -1) this.devices[i] = upd;
        this.prestamosPendientes = this.registrosPrestamos.filter(r => r.deviceId === p.deviceId && !r.devuelto);
        // refrescar lista
        this.prestamosPendientes = this.registrosPrestamos.filter(r => r.deviceId === device.id && !r.devuelto);
        // si ya no quedan pendientes, cerrar modal
        if (this.prestamosPendientes.length === 0) {
          setTimeout(() => this.cerrarPrestamoModal(), 1000);
        }
      }
    });
    this.loadDevices();
  }


}
