import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { CursoDTO } from '../../../../models/DTO/informacion/CursoDTO';
import { CursoService } from '../../../../services/information/curso.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-curso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-curso.html',
  styleUrls: ['./form-curso.css']
})
export class FormCurso implements OnInit {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del curso a editar */
  @Input() idInput!: number;
  cursoData!: CursoDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;
  existingDocumentName: string | null = null;

  constructor(private fb: FormBuilder,
    private serviceCurso: CursoService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit(): void {
    if (this.editMode && this.idInput) {
      this.cargarInfo();
    }
  }
  private cargarInfo() {
    this.serviceCurso.getById(this.idInput).subscribe({
      next: (data) => {
        this.cursoData = data;
        this.populateForm(this.cursoData);
      },
      error: (err) => {
        console.error('Error al cargar el curso:', err);
      }
    }); 
  }


  /**
   * Construye el formulario reactivo para cursos
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      tipoProductividad: ['Curso de duración corta', Validators.required],
      autoresString: ['', Validators.required],

      // Campos propios de Curso
      etiquetasString: ['', Validators.required],
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
    // Convertir arrays a strings separados por coma para los inputs
    const autoresString = (data.autores && Array.isArray(data.autores))
      ? data.autores.join(', ')
      : '';
    const etiquetasString = (data.etiquetas && Array.isArray(data.etiquetas))
      ? data.etiquetas.join(', ')
      : '';

    this.form.patchValue({
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Curso de duración corta',
      autoresString: autoresString,
      etiquetasString: etiquetasString,
      propiedadIntelectual: data.propiedadIntelectual,
      duracion: data.duracion,
      institucion: data.institucion,
      link: data.link || '',
      image_url: data.image_r2 || ''
    });

    // Si trae imagen, mostrar preview
    if (data.image_r2) {
      this.imagePreview = data.image_r2!;
    }

    if (data.file_r2) {
      this.existingDocumentName = data.file_r2;
    }
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
   * Elimina el archivo de documento seleccionado o existente (solo visualmente)
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
    if (this.editMode && !this.existingDocumentName && this.cursoData.file_r2) {
      this.serviceCurso.deleteFile(this.cursoData.id!).subscribe({
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    // Preparar datos: convertir strings a arrays si es necesario
    const formData = { ...this.form.value };
    
    // Convertir autoresString a array
    const autores = typeof formData.autoresString === 'string' 
      ? formData.autoresString
          .split(',')
          .map((a: string) => a.trim())
          .filter((a: string) => a)
      : [];
    
    // Convertir etiquetasString a array
    const etiquetas = typeof formData.etiquetasString === 'string'
      ? formData.etiquetasString
          .split(',')
          .map((e: string) => e.trim())
          .filter((e: string) => e)
      : [];
    
    // Preparar objeto final sin los campos string
    const dataToSend = {
      ...formData,
      autores,
      etiquetas
    };
    
    delete dataToSend.autoresString;
    delete dataToSend.etiquetasString;
    delete dataToSend.image_url;
    
    const payload: FormSubmitPayload = {
      data: dataToSend,
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };

    this.formSubmit.emit(payload);
  }
}

