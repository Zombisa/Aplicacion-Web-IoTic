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
  @Input() editMode: boolean = false;

  /** Datos del proceso/técnica a editar */
  @Input() idInput!: number;
  procesoData!: ProcesoTecnicaDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;
  existingDocumentName: string | null = null;

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
      anio: ['', Validators.required],
      autoresString: ['', Validators.required],
      

      // Campos propios de ProcesoTecnica
      etiquetasGTIString: ['', Validators.required],
      
      licencia: ['', Validators.required],

      // El padre la completa luego cuando sube la imagen
      image_url: ['']
    });
  }

  /**
   * Llena el formulario con los datos existentes
   */
  private populateForm(data: ProcesoTecnicaDTO): void {
    // Convertir arrays de autores y etiquetas a strings separados por coma
    const autoresString = (data.autores && Array.isArray(data.autores))
      ? data.autores.join(', ')
      : '';

    const etiquetasGTIString = (data.etiquetasGTI && Array.isArray(data.etiquetasGTI))
      ? data.etiquetasGTI.join(', ')
      : '';

    this.form.patchValue({
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Procesos o Técnicas',
      pais: data.pais,
      anio: data.anio,
      autoresString: autoresString,
      autores: data.autores || [],
      etiquetasGTIString: etiquetasGTIString,
      etiquetasGTI: data.etiquetasGTI || [],
      licencia: data.licencia,
      image_url: data.image_r2 || ''
    });

    if (data.image_r2) {
      this.imagePreview = data.image_r2!;
    }

    // Si existe un archivo, mostrar que ya hay documento
    if (data.file_r2) {
      this.existingDocumentName = data.file_r2!;
    }
  }

  /**
   * Captura el archivo de imagen seleccionado y genera un preview
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
   * Captura el archivo documento seleccionado
   */
  onDocumentSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedDocument = file;
  }

  /**
   * Elimina el documento seleccionado
   */
  removeFile(): void {
    this.selectedDocument = null;
    this.existingDocumentName = null;
  }

  /**
   * Envía el formulario al componente padre
   */
  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Preparar datos
    const formData = { ...this.form.value };
    
    // Convertir autoresString a array si aún es string
    if (typeof formData.autoresString === 'string') {
      formData.autores = formData.autoresString
        .split(',')
        .map((a: string) => a.trim())
        .filter((a: string) => a);
    }

    // Convertir etiquetasGTIString a array si aún es string
    if (typeof formData.etiquetasGTIString === 'string') {
      formData.etiquetasGTI = formData.etiquetasGTIString
        .split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e);
    }
    
    // Remover los campos string ya que no los necesitamos en la petición
    delete formData.autoresString;
    delete formData.etiquetasGTIString;
    
    const payload: FormSubmitPayload = {
      data: formData,
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };

    this.formSubmit.emit(payload);
  }
}
