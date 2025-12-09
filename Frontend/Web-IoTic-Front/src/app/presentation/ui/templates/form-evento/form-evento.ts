import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { EventoDTO } from '../../../../models/DTO/informacion/EventoDTO';

@Component({
  selector: 'app-form-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-evento.html',
  styleUrls: ['./form-evento.css']
})
export class FormEvento implements OnChanges {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del evento a editar */
  @Input() eventoData!: EventoDTO;

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
    if (this.editMode && this.eventoData) {
      this.populateForm(this.eventoData);
    }
  }

  /**
   * Construye el formulario reactivo para eventos
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      tipoProductividad: ['Organización de eventos', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required],
      autores: [[], Validators.required],

      // Campos propios de Evento
      etiquetas: [[], Validators.required],
      propiedadIntelectual: ['', Validators.required],
      alcance: ['', Validators.required],
      institucion: ['', Validators.required],

      // El padre la completa luego cuando sube la imagen
      image_url: ['']
    });
  }

  /**
   * Llena el formulario con los datos del evento
   * @param data datos del evento a editar
   */
  private populateForm(data: EventoDTO): void {
    this.form.patchValue({
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Organización de eventos',
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],
      etiquetas: data.etiquetas || [],
      propiedadIntelectual: data.propiedadIntelectual,
      alcance: data.alcance,
      institucion: data.institucion,
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
   * Maneja cambio de texto en campo Etiquetas (separadas por coma)
   */
  onEtiquetasChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    const etiquetas = value
      .split(',')
      .map(e => e.trim())
      .filter(e => e);

    this.form.patchValue({ etiquetas });
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

