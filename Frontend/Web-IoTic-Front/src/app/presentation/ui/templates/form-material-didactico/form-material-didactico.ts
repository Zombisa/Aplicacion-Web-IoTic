import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { MaterialDidacticoDTO } from '../../../../models/DTO/informacion/MaterialDidacticoDTO';

@Component({
  selector: 'app-form-material-didactico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-material-didactico.html',
  styleUrls: ['./form-material-didactico.css']
})
export class FormMaterialDidactico implements OnChanges {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del material didáctico a editar */
  @Input() materialData!: MaterialDidacticoDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.buildForm();
  }

  /**
   * Detecta cambios en los inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.editMode && this.materialData) {
      this.populateForm(this.materialData);
    }
  }

  /**
   * Construye el formulario reactivo para material didáctico
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      tipoProductividad: ['Desarrollo de material didáctico', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required],
      autores: [[], Validators.required],

      // Campos propios de MaterialDidactico
      descripcion: ['', Validators.required],
      etiquetasGTI: [[], Validators.required],
      licencia: ['', Validators.required],

      // El padre la completa luego cuando sube la imagen
      image_url: ['']
    });
  }

  /**
   * Llena el formulario con los datos del material didáctico
   * @param data datos del material didáctico a editar
   */
  private populateForm(data: MaterialDidacticoDTO): void {
    this.form.patchValue({
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Desarrollo de material didáctico',
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],
      descripcion: data.descripcion,
      etiquetasGTI: data.etiquetasGTI || [],
      licencia: data.licencia,
      image_url: (data as any).image_url || data.image_r2 || ''
    });

    // Si trae imagen, mostrar preview
    if ((data as any).image_url || data.image_r2) {
      this.imagePreview = (data as any).image_url || data.image_r2!;
    }
  }

  /**
   * Maneja cambio de texto en campo Autores (separados por coma)
   */
  onAutoresChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    const autores = value
      .split(',')
      .map(a => a.trim())
      .filter(a => a);

    this.form.patchValue({ autores });
  }

  /**
   * Maneja cambio de texto en campo Etiquetas GTI (separadas por coma)
   */
  onEtiquetasChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    const etiquetasGTI = value
      .split(',')
      .map(e => e.trim())
      .filter(e => e);

    this.form.patchValue({ etiquetasGTI });
  }

  /**
   * Captura el archivo de imagen seleccionado y genera un preview
   */
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  /**
   * Captura el archivo documento seleccionado
   */
  onDocumentSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;
    this.selectedDocument = file;
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
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };

    this.formSubmit.emit(payload);
  }
}

