import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { TutoriaEnMarchaDTO } from '../../../../models/DTO/informacion/TutoriaEnMarchaDTO';

@Component({
  selector: 'app-form-tutoria-en-marcha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-tutoria-en-marcha.html',
  styleUrls: ['./form-tutoria-en-marcha.css']
})
export class FormTutoriaEnMarcha implements OnChanges {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  @Input() editMode: boolean = false;
  @Input() data!: TutoriaEnMarchaDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editMode && this.data) {
      this.populateForm(this.data);
    }
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      titulo: ['', Validators.required],
      subtipoTitulo: ['', Validators.required],
      tipoProductividad: ['Tutoría en marcha', Validators.required],

      descripcion: ['', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required],

      orientados: [[]],
      programa: ['', Validators.required],
      institucion: ['', Validators.required],

      autores: [[]],
      etiquetasGTI: [[]],
      licencia: ['', Validators.required],

      image_url: ['']
    });
  }

  private populateForm(data: TutoriaEnMarchaDTO): void {
    this.form.patchValue({
      titulo: data.titulo,
      subtipoTitulo: data.subtipoTitulo,
      descripcion: data.descripcion,
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

    if (data.image_r2) {
      this.imagePreview = data.image_r2;
    }
  }

  /** --- Métodos para arrays --- */

  onOrientadosChange(value: string): void {
    const orientados = value.split(',').map(v => v.trim()).filter(v => v);
    this.form.patchValue({ orientados });
  }

  onAutoresChange(value: string): void {
    const autores = value.split(',').map(v => v.trim()).filter(v => v);
    this.form.patchValue({ autores });
  }

  onEtiquetasChange(value: string): void {
    const etiquetasGTI = value.split(',').map(v => v.trim()).filter(v => v);
    this.form.patchValue({ etiquetasGTI });
  }

  /** --- Imagen --- */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  /** --- Documento --- */
  onDocumentSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedDocument = file;
  }

  /** --- Submit --- */
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
