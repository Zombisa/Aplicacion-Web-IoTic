import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { TutoriaConcluidaDTO } from '../../../../models/DTO/informacion/TutoriaConcluidaDTO';
import { TutoriaConcluidaService } from '../../../../services/information/tutoria-concluida.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-tutoria-concluida',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-tutoria-concluida.html',
  styleUrls: ['./form-tutoria-concluida.css']
})
export class FormTutoriaConcluida implements OnInit{

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos de la tutoría a editar */
  @Input() idInput!: number;
  data!: TutoriaConcluidaDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;
  existingDocumentName: string | null = null;

  constructor(private fb: FormBuilder,
    private serviceTutoria: TutoriaConcluidaService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit(): void {
    if (this.editMode && this.idInput) {
      this.cargarInfo();
    }
  }
  private cargarInfo() {  
    this.serviceTutoria.getById(this.idInput).subscribe({
      next: (data) => {
        console.log(data);
        this.data = data;
        this.populateForm(this.data);
      },
      error: (err) => {
        console.error('Error al cargar la tutoría concluida:', err);
      }
    }); 
  }



  /**
   * Construye el formulario reactivo para tutoría concluida
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      pais: ['', Validators.required],
      tipoProductividad: ['Tutoria conlcuida'],
      anio: ['', Validators.required],

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
      image_url:  data.image_r2 || ''
    });

    if ( data.image_r2) {
      this.imagePreview = data.image_r2!;
    }

    if (data.file_r2) {
      this.existingDocumentName = data.file_r2;
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

    const maxSize = 20 * 1024 * 1024; // 20 MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo demasiado grande',
        text: 'El archivo supera el tamaño máximo permitido de 20 MB.',
        confirmButtonText: 'Aceptar'
      });
      event.target.value = ""; // limpiar input
      return;
    }

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

    // Si en modo editar se quitó un documento existente, eliminarlo del servidor antes de emitir
    if (this.editMode && !this.existingDocumentName && this.data.file_r2) {
      this.serviceTutoria.deleteFile(this.data.id!).subscribe({
        next: () => {
          this.emitirFormulario();
        },
        error: (err: any) => {
          console.error("Error al eliminar documento:", err);
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar documento',
            text: 'No se pudo eliminar el documento. Intenta de nuevo.',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    } else {
      this.emitirFormulario();
    }
  }

  /**
   * Emite el formulario al componente padre
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
