import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { InventoryService } from '../../../../services/inventory.service';
import { Header } from '../../templates/header/header';

@Component({
  selector: 'app-add-item',
  imports: [CommonModule, Header],
  templateUrl: './add-item.html',
  styleUrl: './add-item.css'
})
export class AddItem {
  private itenmToSave?: ItemDTOPeticion;
  constructor(private inventoryService: InventoryService) { }

}
