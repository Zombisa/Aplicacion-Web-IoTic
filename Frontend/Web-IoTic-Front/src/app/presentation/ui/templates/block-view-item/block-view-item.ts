import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { InventoryService } from '../../../../services/inventory.service';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';

@Component({
  selector: 'app-block-view-item',
  imports: [CommonModule],
  templateUrl: './block-view-item.html',
  styleUrl: './block-view-item.css'
})
export class BlockViewItem implements  OnChanges{
  @Input() itemId!: number;
  public itemDetails?: ItemDTO;
  constructor(
    private inventoryService: InventoryService
  ) {}

  ngOnChanges(): void {
    if (this.itemId) {
      this.loadItemDetails();
    }
  }
  
  /**
   * Carga los detalles del ítem desde el servicio de inventario
   * obtiene el idTiem del input y manda la peticion al backend
   * @returns void
   * 
   */
  loadItemDetails(): void {
    this.inventoryService.getElectronicComponentById(this.itemId).subscribe(item => {
      this.itemDetails = item;
      console.log('Item details loaded:', this.itemDetails);
    });
  }

}
