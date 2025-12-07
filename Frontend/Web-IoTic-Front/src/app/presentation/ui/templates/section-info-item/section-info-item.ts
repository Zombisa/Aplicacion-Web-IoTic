import { CommonModule } from '@angular/common';
import { Component, Input, Output } from '@angular/core';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { EventEmitter } from '@angular/core';


@Component({
  selector: 'app-section-info-item',
  imports: [CommonModule],
  templateUrl: './section-info-item.html',
  styleUrl: './section-info-item.css'
})
export class SectionInfoItem {

  /// Item del cual se mostrará la información
  @Input() item!: ItemDTO;
  @Input() showActions: boolean = false;

  //Emite un evento cuando se presiona un botón de acción, envia la accion a realizar y el item asociado
  // Edit, delete, loan,
  // y envia el item asociado
  @Output() functionEmitter = new EventEmitter<string>();


  public goToEdit(): void {
    console.log('Emitiendo evento de edición para el item:' );
    this.functionEmitter.emit("edit");
  }

  public goToDelete(): void {
    this.functionEmitter.emit("delete");
  }

  public goToLoan(): void {
    this.functionEmitter.emit("loan");
  }

  public goToViewLoan(): void {
    this.functionEmitter.emit("viewLoan");
  }


}
