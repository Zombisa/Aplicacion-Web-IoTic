import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { TutoriaConcluidaDTO } from '../../../../models/DTO/informacion/TutoriaConcluidaDTO';

@Component({
  selector: 'app-form-tutoria-concluida',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-tutoria-concluida.html',
  styleUrls: ['./form-tutoria-concluida.css']
})
export class FormTutoriaConcluida implements OnChanges {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos de la tutoría a editar */
  @Input() data!: TutoriaConcluidaDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editMode && this.data) {
      this.populateForm(this.data);
    }
  }

  /**
   * Construye el formulario reactivo para tutoría concluida
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      tipoProductividad: ['Tutoría concluida', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required], // puedes cambiar a number si quieres

      // Campos propios
      orientados: [[], Validators.required],
      programa: ['', Validators.required],
      institucion: ['', Validators.required],
      autores: [[], Validators.required],
      etiquetasGTI: [[], Validators.required],
      licencia: ['', Validators.required],

      // La completa el padre cuando sube la imagen
      image_url: ['']
    });
  }

  /**
   * Llena el formulario con los datos existentes
   */
  private populateForm(data: TutoriaConcluidaDTO): void {
    this.form.patchValue({
      titulo: data.titulo,
      pais: data.pais,
      anio: data.anio,
      orientados: data.orientados || [],
      programa: data.programa,
      institucion: data.institucion,
      autores: data.autores || [],
      etiquetasGTI: data.etiquetasGTI || [],
      licencia: data.licencia,
      image_url: (data as any).image_url || data.image_r2 || ''
    });

    if ((data as any).image_url || data.image_r2) {
      this.imagePreview = (data as any).image_url || data.image_r2!;
    }
  }

  /** Manejo de inputs de listas */

  onOrientadosChange(value: string): void {
    const orientados = value
      .split(',')
      .map(o => o.trim())
      .filter(o => o);
    this.form.patchValue({ orientados });
  }

  onAutoresChange(value: string): void {
    const autores = value
      .split(',')
      .map(a => a.trim())
      .filter(a => a);
    this.form.patchValue({ autores });
  }

  onEtiquetasChange(value: string): void {
    const etiquetasGTI = value
      .split(',')
      .map(e => e.trim())
      .filter(e => e);
    this.form.patchValue({ etiquetasGTI });
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
}
