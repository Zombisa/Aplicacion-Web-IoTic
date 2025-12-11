import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { InventoryService } from '../services/inventory.service';
import { map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemAvailableGuard implements CanActivate {

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const id = Number(route.paramMap.get('id'));

    return this.inventoryService.getElectronicComponentById(id).pipe(
      map(item => {
        if (item.estado_admin !== 'Prestado') {
          return true; // Puede acceder
        }
        this.router.navigate(['/inventario/view-item', id], {
          queryParams: { error: 'prestado' }
        });

        return false;
      }),
      catchError(() => {
        this.router.navigate(['/inventario']);
        return of(false);
      })
    );
  }
}
