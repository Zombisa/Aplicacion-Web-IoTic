import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { MaterialDidacticoDTO } from '../../../../models/DTO/informacion/MaterialDidacticoDTO';
import { MaterialDidacticoService } from '../../../../services/information/material-didactico.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-material-didactico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-material-didactico.html',
  styleUrls: ['./form-material-didactico.css']
})
export class FormMaterialDidactico implements OnInit {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del material didáctico a editar */
  @Input() idInput!: number;
  materialData!: MaterialDidacticoDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;
  existingDocumentName: string | null = null;

  constructor(private fb: FormBuilder, private serviceMaterialDidactico: MaterialDidacticoService) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    if (this.editMode && this.idInput) {
      this.cargarInfo();
    }
  }

  private cargarInfo(): void {
    this.serviceMaterialDidactico.getById(this.idInput).subscribe({
      next: (data) => {
        console.log(data);
        this.materialData = data;
        this.populateForm(this.materialData);
      },
      error: (err) => {
        console.error('Error al cargar el material didáctico:', err);
      }
    });
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

    if (data.file_r2) {
      this.existingDocumentName = data.file_r2;
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
   * Quita el archivo documento seleccionado
   */
  removeFile(): void {
    if (this.existingDocumentName) {
      this.existingDocumentName = null;
    } else {
      this.selectedDocument = null;
    }
  }

  /**
   * Envía el formulario al componente padre
   */
  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Si estamos en modo edición y el usuario removió el documento existente
    if (this.editMode && !this.existingDocumentName && this.materialData.file_r2) {
      this.serviceMaterialDidactico.deleteFile(this.materialData.id!).subscribe({
        next: () => this.emitirFormulario(),
        error: (err: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el documento'
          });
        }
      });
    } else {
      this.emitirFormulario();
    }
  }

  /**
   * Emite el formulario con los datos convertidos
   */
  private emitirFormulario(): void {
    const payload: FormSubmitPayload = {
      data: this.form.value,
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };

    this.formSubmit.emit(payload);
  }
}

