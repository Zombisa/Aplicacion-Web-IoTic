import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type EstadoItem = 'Nuevo' | 'Operativo' | 'En mantenimiento' | 'Dado de baja';
export type TipoItem = 'CONSUMIBLE' | 'NO_CONSUMIBLE';

export interface Device {
  id: number;
  referencia: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: TipoItem;
  unidad: string;
  cantidad: number;
  valorUnitario: number;
  valorTotal: number;          // calculado en frontend por ahora
  estado: EstadoItem;
  ubicacion: string;
  fechaAdquisicion: string;    // ISO string 'YYYY-MM-DD'
  documentoSoporte?: string;   // URL o número
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  // 🧪 Datos simulados (mock)
  private devices: Device[] = [
    {
      id: 1,
      referencia: 'MCU-UNO',
      nombre: 'Arduino Uno',
      descripcion: 'Microcontrolador básico',
      categoria: 'Microcontrolador',
      tipo: 'NO_CONSUMIBLE',
      unidad: 'unidad',
      cantidad: 5,
      valorUnitario: 95000,
      valorTotal: 5 * 95000,
      estado: 'Operativo',
      ubicacion: 'Armario 1 - Lab IoTIC',
      fechaAdquisicion: '2024-08-15',
      documentoSoporte: 'OC-2024-0021'
    },
    {
      id: 2,
      referencia: 'SEN-DHT11',
      nombre: 'Sensor DHT11',
      descripcion: 'Sensor de temperatura y humedad',
      categoria: 'Sensor',
      tipo: 'CONSUMIBLE',
      unidad: 'unidad',
      cantidad: 30,
      valorUnitario: 6000,
      valorTotal: 30 * 6000,
      estado: 'Nuevo',
      ubicacion: 'Cajón Sensores A',
      fechaAdquisicion: '2025-01-10'
    },
    {
      id: 3,
      referencia: 'MCU-ESP32',
      nombre: 'ESP32',
      descripcion: 'Controlador Wi-Fi y Bluetooth',
      categoria: 'Microcontrolador',
      tipo: 'NO_CONSUMIBLE',
      unidad: 'unidad',
      cantidad: 3,
      valorUnitario: 38000,
      valorTotal: 3 * 38000,
      estado: 'En mantenimiento',
      ubicacion: 'Banco de pruebas',
      fechaAdquisicion: '2024-10-02'
    }
  ];

  constructor() {}

  getDevices(): Observable<Device[]> {
    return of([...this.devices]);
  }

  addDevice(device: Device): Observable<Device> {
    const id = this.devices.length ? Math.max(...this.devices.map(d => d.id)) + 1 : 1;
    const valorTotal = (device.cantidad || 0) * (device.valorUnitario || 0);
    const nuevo: Device = { ...device, id, valorTotal };
    this.devices.push(nuevo);
    return of(nuevo);
  }

  updateDevice(id: number, updatedDevice: Device): Observable<Device> {
    const index = this.devices.findIndex(d => d.id === id);
    if (index !== -1) {
      const valorTotal = (updatedDevice.cantidad || 0) * (updatedDevice.valorUnitario || 0);
      this.devices[index] = { ...updatedDevice, id, valorTotal };
      return of(this.devices[index]);
    }
    return of(updatedDevice);
  }

  deleteDevice(id: number): Observable<void> {
    this.devices = this.devices.filter(d => d.id !== id);
    return of(void 0);
  }
}
