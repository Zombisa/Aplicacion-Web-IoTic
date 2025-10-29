import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_COMPONENTS } from '../mocks/electronicComponent.mock';
import { ElectronicComponent } from '../models/electronicComponent.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  
  private components: ElectronicComponent[] = [...MOCK_COMPONENTS];

  constructor() {}

  getElectronicComponent(): Observable<ElectronicComponent[]> {
    return of([...this.components]);
  }

  addElectronicComponent(device: ElectronicComponent): Observable<ElectronicComponent> {
    const id = this.components.length ? Math.max(...this.components.map(d => d.id)) + 1 : 1;
    const nuevo: ElectronicComponent = { ...device, id };
    this.components.push(nuevo);
    return of(nuevo);
  }

  updateElectronicComponent(id: number, updatedElectronicComponent: ElectronicComponent): Observable<ElectronicComponent> {
    const index = this.components.findIndex(d => d.id === id);
    if (index !== -1) {
      this.components[index] = { ...updatedElectronicComponent, id};
      return of(this.components[index]);
    }
    return of(updatedElectronicComponent);
  }

  deleteElectronicComponent(id: number): Observable<void> {
    this.components = this.components.filter(d => d.id !== id);
    return of(void 0);
  }
}
