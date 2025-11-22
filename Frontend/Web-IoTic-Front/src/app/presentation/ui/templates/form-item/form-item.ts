import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-item',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-item.html',
  styleUrl: './form-item.css'
})
export class FormItem {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() item?: ItemDTOPeticion;

  @Output() submitted = new EventEmitter<ItemDTOPeticion>();

  itemForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.itemForm = this.fb.group({
      descripcion: [this.item?.descripcion || '', [Validators.required, Validators.minLength(10)]],
      estado_fisico: [this.item?.estado_fisico || '', Validators.required],
      estado_admin: [this.item?.estado_admin || '', Validators.required],
      observacion: [this.item?.observacion || ''],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const data: ItemDTOPeticion = this.itemForm.value;
    this.submitted.emit(data); // el padre maneja la llamada al servicio y los mensajes
  }

  resetForm() {
    this.itemForm.reset({
      descripcion: '',
      estado_fisico: '',
      estado_admin: '',
      observacion: '',
      cantidad: 1
    });
  }
}
