import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { SoftwareDTO } from '../../../../models/DTO/informacion/SoftwareDTO';
import { SoftwareService } from '../../../../services/information/software.service';
import { codigoRegistroValidator } from '../../../../validators/codigo-registro-validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-software',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-software.html',
  styleUrls: ['./form-software.css']
})
export class FormSoftware implements OnInit {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del software a editar */
  @Input() idInput!: number;
  softwareData!: SoftwareDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;
  existingDocumentName: string | null = null;

  constructor(private fb: FormBuilder,
    private serviceSoftware: SoftwareService
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
    // Año - máximo 4 dígitos
    this.form.get('anio')?.valueChanges.subscribe(value => {
      if (value && value.toString().length > 4) {
        this.form.get('anio')?.setValue(value.toString().slice(0, 4), { emitEvent: false });
      }
    });
  }
  private cargarInfo() {
    this.serviceSoftware.getById(this.idInput).subscribe({
      next: (data) => {
        console.log(data);
        this.softwareData = data;
        this.populateForm(this.softwareData);
      },
      error: (err) => {
        console.error('Error al cargar el software:', err);
      }
    }); 
  }

  /**
   * Detecta cambios en los inputs
   */


  /**
   * Construye el formulario reactivo para software
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      tipoProductividad: ['Software'],
      pais: ['', Validators.maxLength(150)],

      // Campos propios de Software
      responsableString: ['', Validators.maxLength(150)],
      etiquetasString: ['', Validators.maxLength(150)],
      nivelAcceso: ['', Validators.maxLength(150)],
      tipoProducto: ['', Validators.maxLength(150)],
      codigoRegistro: ['', [Validators.maxLength(50), codigoRegistroValidator]],
      descripcionFuncional: ['', Validators.maxLength(500)],
      propiedadIntelectual: ['', Validators.maxLength(150)]
    });
  }

  /**
   * Llena el formulario con los datos del software
   * @param data datos del software a editar
   */
  private populateForm(data: SoftwareDTO): void {
    const responsableString = data.responsable?.join(', ') || '';
    const etiquetasString = data.etiquetas?.join(', ') || '';
    
    this.form.patchValue({
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Software',
      pais: data.pais,
      responsableString,
      etiquetasString,
      nivelAcceso: data.nivelAcceso,
      tipoProducto: data.tipoProducto,
      codigoRegistro: data.codigoRegistro || '',
      descripcionFuncional: data.descripcionFuncional,
      propiedadIntelectual: data.propiedadIntelectual
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
    if (this.editMode && !this.existingDocumentName && this.softwareData.file_r2) {
      this.serviceSoftware.deleteFile(this.softwareData.id!).subscribe({
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
      ?.split(',')
      .map((a: string) => a.trim())
      .filter((a: string) => a) || [];

    formValue.responsable = formValue.responsableString
      ?.split(',')
      .map((r: string) => r.trim())
      .filter((r: string) => r) || [];

    formValue.etiquetas = formValue.etiquetasString
      ?.split(',')
      .map((e: string) => e.trim())
      .filter((e: string) => e) || [];

    // Eliminar campos string
    delete formValue.autoresString;
    delete formValue.responsableString;
    delete formValue.etiquetasString;

    // Asegurarse de que tipoProductividad esté presente
    if (!formValue.tipoProductividad) {
      formValue.tipoProductividad = 'Software';
    }

    const payload: FormSubmitPayload = {
      data: formValue,
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };

    console.log('Payload enviado:', payload);
    this.formSubmit.emit(payload);
  }

}
