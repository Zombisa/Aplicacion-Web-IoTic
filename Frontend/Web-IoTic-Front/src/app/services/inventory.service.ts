import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type EstadoItem = 'Disponible' | 'Dado de baja' | 'Prestado';
export type TipoItem = 'CONSUMIBLE' | 'NO_CONSUMIBLE';

export interface Device {
  id: number;
  referencia: string;
  nombre: string;
  tipo: TipoItem;
  cantidad: number;     
  estado: EstadoItem;
  fechaAdquisicion: string;    // ISO string 'YYYY-MM-DD'
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  // 🧪 Datos simulados (mock)
  private devices: Device[] = [
    {
      id: 1,
      referencia: 'MCU-UNO',
      nombre: 'Arduino Uno',
      tipo: 'NO_CONSUMIBLE',
      cantidad: 5,
      estado: 'Disponible',
      fechaAdquisicion: '2024-08-15'
    },
    {
      id: 2,
      referencia: 'SEN-DHT11',
      nombre: 'Sensor DHT11',
      tipo: 'CONSUMIBLE',
      cantidad: 30,
      estado: 'Prestado',
      fechaAdquisicion: '2025-01-10'
    },
    {
      id: 3,
      referencia: 'MCU-ESP32',
      nombre: 'ESP32',
      tipo: 'NO_CONSUMIBLE',
      cantidad: 3,
      estado: 'Dado de baja',
      fechaAdquisicion: '2024-10-02'
    }
  ];

  constructor() {}

  getDevices(): Observable<Device[]> {
    return of([...this.devices]);
  }

  addDevice(device: Device): Observable<Device> {
    const id = this.devices.length ? Math.max(...this.devices.map(d => d.id)) + 1 : 1;
    const nuevo: Device = { ...device, id };
    this.devices.push(nuevo);
    return of(nuevo);
  }

  updateDevice(id: number, updatedDevice: Device): Observable<Device> {
    const index = this.devices.findIndex(d => d.id === id);
    if (index !== -1) {
      this.devices[index] = { ...updatedDevice, id};
      return of(this.devices[index]);
    }
    return of(updatedDevice);
  }

  deleteDevice(id: number): Observable<void> {
    this.devices = this.devices.filter(d => d.id !== id);
    return of(void 0);
  }
}
