import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { SoftwareDTO } from '../../../../models/DTO/informacion/SoftwareDTO'; // ajusta la ruta si es distinta

@Component({
  selector: 'app-form-software',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-software.html',
  styleUrls: ['./form-software.css']
})
export class FormSoftware implements OnChanges {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del software a editar */
  @Input() softwareData!: SoftwareDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.buildForm();
  }

  /**
   * Detecta cambios en los inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.editMode && this.softwareData) {
      this.populateForm(this.softwareData);
    }
  }

  /**
   * Construye el formulario reactivo para software
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // Campos principales
      tituloDesarrollo: ['', Validators.required],
      tipoProductividad: ['Software', Validators.required],
      pais: ['', Validators.required],

      // Arrays
      responsable: [[], Validators.required],
      etiquetas: [[], Validators.required],

      // Otros datos
      nivelAcceso: ['', Validators.required],
      tipoProducto: ['', Validators.required],
      codigoRegistro: [''],
      descripcionFuncional: ['', Validators.required],
      propiedadIntelectual: ['', Validators.required],

      // La completa el padre cuando sube la imagen
      image_path: [''],
      archivo_path: [''],
      image_r2: [''],
      file_r2: ['']
    });
  }

  /**
   * Llena el formulario con los datos del software
   * @param data datos del software a editar
   */
  private populateForm(data: SoftwareDTO): void {
    this.form.patchValue({
      tituloDesarrollo: (data as any).tituloDesarrollo || (data as any).titulo || '',
      tipoProductividad: data.tipoProductividad || 'Software',
      pais: (data as any).pais || '',

      responsable: (data as any).responsable || [],
      etiquetas: (data as any).etiquetas || [],

      nivelAcceso: (data as any).nivelAcceso || '',
      tipoProducto: (data as any).tipoProducto || '',
      codigoRegistro: (data as any).codigoRegistro || '',
      descripcionFuncional: (data as any).descripcionFuncional || '',
      propiedadIntelectual: (data as any).propiedadIntelectual || '',

      image_r2: (data as any).image_r2 || '',
      file_r2: (data as any).file_r2 || ''
    });

    // Si trae imagen, mostrar preview
    if ((data as any).image_r2) {
      this.imagePreview = (data as any).image_r2;
    }
  }

  /**
   * Captura el archivo seleccionado y genera un preview
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  /**
   * Envía el formulario al componente padre
   */
  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: FormSubmitPayload = {
      data: this.form.value,
      file_image: this.selectedFile
    };

    this.formSubmit.emit(payload);
  }

  onResponsablesChange(value: string): void {
    const responsable = value
      .split(',')
      .map(r => r.trim())
      .filter(r => r);

    this.form.patchValue({ responsable });
  }

  onEtiquetasChange(value: string): void {
    const etiquetas = value
      .split(',')
      .map(e => e.trim())
      .filter(e => e);

    this.form.patchValue({ etiquetas });
  }

}
