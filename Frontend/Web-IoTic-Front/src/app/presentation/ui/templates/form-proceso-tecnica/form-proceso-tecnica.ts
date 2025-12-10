import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { ProcesoTecnicaDTO } from '../../../../models/DTO/informacion/ProcesoTecnicaDTO';
import { ProcesoTecnicaService } from '../../../../services/information/proceso-tecnica.service';

@Component({
  selector: 'app-form-proceso-tecnica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-proceso-tecnica.html',
  styleUrls: ['./form-proceso-tecnica.css']
})
export class FormProcesoTecnica implements OnInit {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() idInput!: number;
   editMode: boolean = false;

  /** Datos del proceso/técnica a editar */
  @Input() procesoData!: ProcesoTecnicaDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder,
    private serviceProceso: ProcesoTecnicaService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit(): void {
    if (this.editMode && this.idInput) {  
      this.cargarInfo();
    }
  }
  private cargarInfo() {
    this.serviceProceso.getById(this.idInput).subscribe({  
      next: (data) => {     
        console.log(data);
        this.procesoData = data;
        this.populateForm(this.procesoData);
      },
      error: (err) => {
        console.error('Error al cargar el proceso/técnica:', err);
      }
    }); 
  } 


  /**
   * Construye el formulario reactivo para Proceso/Técnica
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      tipoProductividad: ['Procesos o Técnicas', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required],       // string en el form, luego el backend lo toma como number
      autores: [[], Validators.required],

      // Campos propios de ProcesoTecnica
      etiquetasGTI: [[], Validators.required],
      licencia: ['', Validators.required],

      // El padre la completa luego cuando sube la imagen
      image_url: ['']
    });
  }

  /**
   * Llena el formulario con los datos existentes
   */
  private populateForm(data: ProcesoTecnicaDTO): void {
    this.form.patchValue({
      titulo: data.titulo,
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],
      etiquetasGTI: data.etiquetasGTI || [],
      licencia: data.licencia,
      imagePreview: data.image_r2 || ''
    });

    if ( data.image_r2) {
      this.imagePreview =  data.image_r2!;
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
