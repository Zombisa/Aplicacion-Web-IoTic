import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { SoftwareDTO } from '../../../../models/DTO/informacion/SoftwareDTO'; // ajusta la ruta si es distinta
import { SoftwareService } from '../../../../services/information/software.service';

@Component({
  selector: 'app-form-software',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-software.html',
  styleUrls: ['./form-software.css']
})
export class FormSoftware implements OnInit{

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

  constructor(private fb: FormBuilder,
    private serviceSoftware: SoftwareService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit(): void {
    if (this.editMode && this.idInput) {
      this.cargarInfo();
    }
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
      titulo: ['', Validators.required],
      tipoProductividad: ['Software', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required],
      autores: [[], Validators.required],

      // Campos propios de Software
      tituloDesarrollo: ['', Validators.required],
      responsable: [[], Validators.required],
      etiquetas: [[], Validators.required],
      nivelAcceso: ['', Validators.required],
      tipoProducto: ['', Validators.required],
      codigoRegistro: [''],
      descripcionFuncional: ['', Validators.required],
      propiedadIntelectual: ['', Validators.required],

      // La completa el padre cuando sube la imagen
      image_url: ['']
    });
  }

  /**
   * Llena el formulario con los datos del software
   * @param data datos del software a editar
   */
  private populateForm(data: SoftwareDTO): void {
    this.form.patchValue({
      // BaseProductivity
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Software',
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],

      // Campos propios de Software
      tituloDesarrollo: data.tituloDesarrollo,
      responsable: data.responsable || [],
      etiquetas: data.etiquetas || [],
      nivelAcceso: data.nivelAcceso,
      tipoProducto: data.tipoProducto,
      codigoRegistro: data.codigoRegistro || '',
      descripcionFuncional: data.descripcionFuncional,
      propiedadIntelectual: data.propiedadIntelectual,

      image_url: data.image_r2 || ''
    });

    // Si trae imagen, mostrar preview
    if ( data.image_r2) {
      this.imagePreview = data.image_r2!;
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

  onAutoresChange(value: string): void {
    const autores = value
      .split(',')
      .map(a => a.trim())
      .filter(a => a);

    this.form.patchValue({ autores });
  }

  onResponsablesChange(value: string): void {
    const responsable = value
      .split(',')
      .map(r => r.trim())
      .filter(r => r);

    this.form.patchValue({ responsable });
  }

  onEtiquetasChange(value: string): void {
    const etiquetas = value
      .split(',')
      .map(e => e.trim())
      .filter(e => e);

    this.form.patchValue({ etiquetas });
  }

}
