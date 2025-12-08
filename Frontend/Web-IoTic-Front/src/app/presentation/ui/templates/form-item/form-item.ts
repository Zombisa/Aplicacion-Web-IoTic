import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { CommonModule } from '@angular/common';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';

@Component({
  selector: 'app-form-item',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-item.html',
  styleUrl: './form-item.css'
})
export class FormItem implements OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() item?: ItemDTO;


  @Output() submitted = new EventEmitter<{itemDTOPeticion: ItemDTOPeticion, file: File}>();
  @Output() formReset = new EventEmitter<void>();
  @Output() deactivateItem = new EventEmitter<void>();
  @Output() deleteItem = new EventEmitter<void>();

  itemForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  public  isLoan: boolean = false;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.populateForm();
    }
  }
  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private initializeForm(): void {
    this.itemForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      estado_fisico: ['', Validators.required],
      estado_admin: ['', Validators.required],
      observacion: [''],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }
  /**
   * Popula el formulario con los datos del item para edición
   */
  private populateForm(): void {
    if (this.item) {
      this.itemForm.patchValue({
        descripcion: this.item.descripcion || '',
        estado_fisico: this.item.estado_fisico || '',
        estado_admin: this.item.estado_admin || '',
        observacion: this.item.observacion || '',
        cantidad: 1,
      });
      if(this.item.estado_admin === 'Prestado'){
        this.isLoan = true;
      }
      this.imagePreview = this.item.image_r2|| '';
    }

  }
  /**
   * 
   * @returns Maneja el envío del formulario, emitiendo los datos al componente padre
   */
  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValue = this.itemForm.value;
    const data: ItemDTOPeticion = {
      ...formValue,
      observacion: formValue.observacion || ''
    };
    
    this.submitted.emit({itemDTOPeticion: data, file: this.selectedFile!});
  }

  resetForm(): void {
    this.itemForm.reset({
      descripcion: '',
      estado_fisico: '',
      estado_admin: '',
      observacion: '',
      cantidad: 1
    });
    this.formReset.emit();
  }

  /**
   * Captura el archivo seleccionado y genera un preview
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  /**
   * Emite evento para dar de baja el item
   */
  onDeactivateItem(): void {
    this.deactivateItem.emit();
  }

  /**
   * Emite evento para eliminar el item
   */
  onDeleteItem(): void {
    this.deleteItem.emit();
  }


}
