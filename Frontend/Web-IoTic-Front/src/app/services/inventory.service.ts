import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Device {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: 'Disponible' | 'Prestado' | 'Dañado';
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  // Datos simulados
  private devices: Device[] = [
    { id: 1, nombre: 'Arduino Uno', descripcion: 'Microcontrolador básico', categoria: 'Microcontrolador', estado: 'Disponible' },
    { id: 2, nombre: 'Sensor DHT11', descripcion: 'Sensor de temperatura y humedad', categoria: 'Sensor', estado: 'Prestado' },
    { id: 3, nombre: 'ESP32', descripcion: 'Controlador Wi-Fi y Bluetooth', categoria: 'Microcontrolador', estado: 'Dañado' }
  ];

  constructor() {}

  // Obtener todos los dispositivos
  getDevices(): Observable<Device[]> {
    return of(this.devices);
  }

  // Agregar un nuevo dispositivo
  addDevice(device: Device): Observable<Device> {
    device.id = this.devices.length + 1;
    this.devices.push(device);
    return of(device);
  }

  // Editar dispositivo
  updateDevice(id: number, updatedDevice: Device): Observable<Device> {
    const index = this.devices.findIndex(d => d.id === id);
    if (index !== -1) {
      this.devices[index] = { ...updatedDevice, id };
    }
    return of(this.devices[index]);
  }

  // Eliminar dispositivo
  deleteDevice(id: number): Observable<void> {
    this.devices = this.devices.filter(d => d.id !== id);
    return of();
  }
}
