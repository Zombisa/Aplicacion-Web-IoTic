import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { CursoDTO } from '../../../../models/DTO/informacion/CursoDTO';

@Component({
  selector: 'app-form-curso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-curso.html',
  styleUrls: ['./form-curso.css']
})
export class FormCurso implements OnChanges {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del curso a editar */
  @Input() cursoData!: CursoDTO;

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
    if (this.editMode && this.cursoData) {
      this.populateForm(this.cursoData);
    }
  }

  /**
   * Construye el formulario reactivo para cursos
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      tipoProductividad: ['Curso de duración corta', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required],
      autores: [[], Validators.required],

      // Campos propios de Curso
      etiquetas: [[], Validators.required],
      propiedadIntelectual: ['', Validators.required],
      duracion: ['', Validators.required],
      institucion: ['', Validators.required],
      link: [''], // Opcional

      // El padre la completa luego cuando sube la imagen
      image_url: ['']
    });
  }

  /**
   * Llena el formulario con los datos del curso
   * @param data datos del curso a editar
   */
  private populateForm(data: CursoDTO): void {
    this.form.patchValue({
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Curso de duración corta',
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],
      etiquetas: data.etiquetas || [],
      propiedadIntelectual: data.propiedadIntelectual,
      duracion: data.duracion,
      institucion: data.institucion,
      link: data.link || '',
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

