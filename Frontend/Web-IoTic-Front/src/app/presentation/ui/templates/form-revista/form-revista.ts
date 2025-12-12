import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { RevistaDTO } from '../../../../models/DTO/informacion/RevistaDTO';
import { RevistaService } from '../../../../services/information/revista.service';
import { urlValidator } from '../../../../validators/url-validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-revista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-revista.html',
  styleUrls: ['./form-revista.css']
})
export class FormRevista implements OnInit {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** ID de la revista a editar */
  @Input() idInput!: number;
  revistaData!: RevistaDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;
  existingDocumentName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private serviceRevista: RevistaService
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    if (this.editMode && this.idInput) {
      this.cargarInfo();
    }
    this.setupNumericFieldLimits();
  }

  /**
   * Configura los límites automáticos para campos numéricos
   */
  private setupNumericFieldLimits(): void {
    // ISSN - máximo 8 dígitos
    this.form.get('issn')?.valueChanges.subscribe(value => {
      if (value && value.toString().length > 8) {
        this.form.get('issn')?.setValue(value.toString().slice(0, 8), { emitEvent: false });
      }
    });

    // VOLUMEN - sin límite específico de longitud (solo números)
    this.form.get('volumen')?.valueChanges.subscribe(value => {
      if (value && value.toString().length > 8) {
        this.form.get('volumen')?.setValue(value.toString().slice(0, 8), { emitEvent: false });
      }
    });

    // FASCÍCULO - sin límite específico de longitud (solo números)
    this.form.get('fasc')?.valueChanges.subscribe(value => {
      if (value && value.toString().length > 10) {
        this.form.get('fasc')?.setValue(value.toString().slice(0, 10), { emitEvent: false });
      }
    });

    // PÁGINAS - máximo 50 caracteres
    this.form.get('paginas')?.valueChanges.subscribe(value => {
      if (value && value.toString().length > 10) {
        this.form.get('paginas')?.setValue(value.toString().slice(0, 10), { emitEvent: false });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idInput'] && this.idInput && this.editMode) {
      this.cargarInfo();
    }
  }

  private cargarInfo(): void {
    this.serviceRevista.getById(this.idInput).subscribe({
      next: (data) => {
        this.revistaData = data;
        this.populateForm(this.revistaData);
      },
      error: (err) => {
        console.error('Error al cargar la revista:', err);
      }
    });
  }

  /**
   * Construye el formulario reactivo para revistas
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(70)]],
      autoresString: ['', Validators.maxLength(150)],
      issn: ['', [Validators.required, Validators.maxLength(8), Validators.pattern(/^\d+$/)]],
      volumen: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      fasc: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      paginas: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^\d+$/)]],
      responsableString: ['', Validators.maxLength(150)],
      linkDescargaArticulo: ['', [Validators.required, Validators.maxLength(150), urlValidator]],
      linksitioWeb: ['', [Validators.required, Validators.maxLength(150), urlValidator]]
    });
  }

  /**
   * Llena el formulario con los datos existentes
   */
  private populateForm(data: RevistaDTO): void {
    const autoresString = data.autores?.join(', ') || '';
    const responsableString = data.responsable?.join(', ') || '';
    this.form.patchValue({
      titulo: data.titulo,
      pais: data.pais,
      anio: data.anio,
      autoresString,
      issn: data.issn,
      volumen: data.volumen,
      fasc: data.fasc,
      paginas: data.paginas,
      responsableString,
      linkDescargaArticulo: data.linkDescargaArticulo || '',
      linksitioWeb: data.linksitioWeb || ''
    });

    if (data.image_r2) {
      this.imagePreview = data.image_r2;
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
    // Solo se quita visualmente, la eliminación real ocurre en submitForm()
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
      // Marcar todos los campos como touched para mostrar errores
      this.form.markAllAsTouched();
      
      // También marcar como dirty los campos que tienen valores pero son inválidos
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.invalid && control.value) {
          control.markAsDirty();
        }
      });
      
      // Mostrar mensaje general si hay errores
      const linkDescargaError = this.form.get('linkDescargaArticulo')?.errors;
      const linkSitioError = this.form.get('linksitioWeb')?.errors;
      
      if (linkDescargaError?.['invalidUrl'] || linkSitioError?.['invalidUrl']) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          html: 'Por favor, revise los campos de link. Deben ser URLs válidas (ejemplo: https://ejemplo.com)',
          confirmButtonText: 'Entendido'
        });
      }
      
      return;
    }

    // Si en modo editar se quitó un documento existente, eliminarlo del servidor antes de emitir
    if (this.editMode && !this.existingDocumentName && this.revistaData.file_r2) {
      this.serviceRevista.deleteFile(this.revistaData.id!).subscribe({
        next: () => {
          this.emitirFormulario();
        },
        error: (err) => {
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
    const formValue = { ...this.form.value };

    // Convertir strings a arrays
    formValue.autores = formValue.autoresString
      .split(',')
      .map((a: string) => a.trim())
      .filter((a: string) => a);

    formValue.responsable = formValue.responsableString
      .split(',')
      .map((r: string) => r.trim())
      .filter((r: string) => r);

    // Eliminar campos string
    delete formValue.autoresString;
    delete formValue.responsableString;

    const payload: FormSubmitPayload = {
      data: formValue,
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };

    this.formSubmit.emit(payload);
  }
}
