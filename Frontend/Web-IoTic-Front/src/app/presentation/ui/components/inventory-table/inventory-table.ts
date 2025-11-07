import { Component, Input } from '@angular/core';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-table',
  imports: [CommonModule],
  templateUrl: './inventory-table.html',
  styleUrl: './inventory-table.css'
})
export class InventoryTable {
  @Input() inventoryData: ItemDTO[] = [];

}
