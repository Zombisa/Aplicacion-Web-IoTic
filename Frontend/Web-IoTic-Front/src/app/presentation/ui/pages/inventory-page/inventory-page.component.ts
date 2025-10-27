import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Device, InventoryService } from '../../../../services/inventory.service';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-page.component.html',
  styleUrls: ['./inventory-page.component.css']
})
export class InventoryPageComponent implements OnInit {

  devices: Device[] = [];
  newDevice: Device = { id: 0, nombre: '', descripcion: '', categoria: '', estado: 'Disponible' };

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.loadDevices();
  }

  //  Cargar dispositivos
  loadDevices(): void {
    this.inventoryService.getDevices().subscribe({
      next: (data) => (this.devices = data),
      error: (err) => console.error('Error al cargar dispositivos:', err)
    });
  }

  //  Agregar nuevo dispositivo
  addDevice(): void {
    if (!this.newDevice.nombre.trim()) return;
    this.inventoryService.addDevice(this.newDevice).subscribe({
      next: (device) => {
        this.devices.push(device);
        this.newDevice = { id: 0, nombre: '', descripcion: '', categoria: '', estado: 'Disponible' };
      },
      error: (err) => console.error('Error al agregar dispositivo:', err)
    });
  }

  //  Eliminar dispositivo
  deleteDevice(id: number): void {
    this.inventoryService.deleteDevice(id).subscribe({
      next: () => (this.devices = this.devices.filter((d) => d.id !== id)),
      error: (err) => console.error('Error al eliminar dispositivo:', err)
    });
  }

  //  Cambiar estado (Disponible ↔ Prestado)
  toggleEstado(device: Device): void {
    const nuevoEstado: 'Disponible' | 'Prestado' | 'Dañado' =
      device.estado === 'Disponible' ? 'Prestado' : 'Disponible';

    const actualizado: Device = { ...device, estado: nuevoEstado };

    this.inventoryService.updateDevice(device.id, actualizado).subscribe({
      next: (d: Device) => {
        const index = this.devices.findIndex((x) => x.id === d.id);
        if (index !== -1) this.devices[index] = d;
      },
      error: (err: any) => console.error('Error al cambiar estado:', err)
    });
  }
}
