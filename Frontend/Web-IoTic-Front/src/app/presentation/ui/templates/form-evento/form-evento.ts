import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { EventoDTO } from '../../../../models/DTO/informacion/EventoDTO';
import { EventoService } from '../../../../services/information/evento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-evento.html',
  styleUrls: ['./form-evento.css']
})
export class FormEvento implements OnInit{

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del evento a editar */
  @Input() idInput!: number;
   eventoData!: EventoDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;
  existingDocumentName: string | null = null;

  constructor(private fb: FormBuilder,
    private serviceEvento: EventoService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit(): void {
    if (this.editMode && this.idInput) {
      this.cargarInfo();
    }
  }
  private cargarInfo() {
    this.serviceEvento.getById(this.idInput).subscribe({
      next: (data) => {     
        console.log(data);
        this.eventoData = data;
        this.populateForm(this.eventoData);
      },
      error: (err) => {
        console.error('Error al cargar el evento:', err);
      }
    }); 
  }


  /**
   * Construye el formulario reactivo para eventos
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      tipoProductividad: ['Organización de eventos', Validators.required],

      // Campos tipo string para edición (se convierten a arrays en emitirFormulario)
      autoresString: ['', Validators.required],
      etiquetasString: ['', Validators.required],

      // Campos propios de Evento
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
    // Convertir arrays a strings separados por coma
    const autoresString = (data.autores && Array.isArray(data.autores))
      ? data.autores.join(', ')
      : '';
    
    const etiquetasString = (data.etiquetas && Array.isArray(data.etiquetas))
      ? data.etiquetas.join(', ')
      : '';

    this.form.patchValue({
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Organización de eventos',
      autoresString: autoresString,
      etiquetasString: etiquetasString,
      propiedadIntelectual: data.propiedadIntelectual,
      alcance: data.alcance,
      institucion: data.institucion,
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
   * Valida el tamaño máximo de 20 MB
   */
  onDocumentSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024; // 20 MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo demasiado grande',
        text: 'El archivo supera el tamaño máximo permitido de 20 MB.',
        confirmButtonText: 'Aceptar'
      });
      event.target.value = "";
      return;
    }

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
    if (this.editMode && !this.existingDocumentName && this.eventoData.file_r2) {
      this.serviceEvento.deleteFile(this.eventoData.id!).subscribe({
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
    // Preparar datos
    const formData = { ...this.form.value };

    // Convertir autoresString a array
    if (typeof formData.autoresString === 'string') {
      formData.autores = formData.autoresString
        .split(',')
        .map((a: string) => a.trim())
        .filter((a: string) => a);
    }

    // Convertir etiquetasString a array
    if (typeof formData.etiquetasString === 'string') {
      formData.etiquetas = formData.etiquetasString
        .split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e);
    }

    // Remover los campos string ya que no los necesitamos en la petición
    delete formData.autoresString;
    delete formData.etiquetasString;

    const payload: FormSubmitPayload = {
      data: formData,
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };

    this.formSubmit.emit(payload);
  }
}

