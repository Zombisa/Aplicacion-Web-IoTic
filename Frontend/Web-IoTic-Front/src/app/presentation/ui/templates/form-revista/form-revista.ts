import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { RevistaDTO } from '../../../../models/DTO/informacion/RevistaDTO';
import { RevistaService } from '../../../../services/information/revista.service';

@Component({
  selector: 'app-form-revista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-revista.html',
  styleUrls: ['./form-revista.css']
})
export class FormRevista implements OnInit{

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos de la revista a editar */
  @Input() revistaData!: RevistaDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder,
    private serviceRevista: RevistaService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit(): void {
    if (this.editMode && this.revistaData) {
      this.cargarInfo();
    }
  }
  private cargarInfo() {
    this.serviceRevista.getById(this.revistaData.id!).subscribe({
      next: (data) => {
        console.log(data);
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
      // BaseProductivity
      tipoProductividad: ['Revistas', Validators.required],
      titulo: ['', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required],
      autores: [[], Validators.required],

      // Campos propios de Revista
      issn: ['', Validators.required],
      volumen: ['', Validators.required],
      fasc: ['', Validators.required],
      paginas: ['', Validators.required],
      responsable: [[], Validators.required],
      linkDescargaArticulo: [''],
      linksitioWeb: [''],

      // El padre la completa luego cuando sube la imagen
      image_url: ['']
    });
  }

  /**
   * Llena el formulario con los datos existentes
   */
  private populateForm(data: RevistaDTO): void {
    this.form.patchValue({
      // BaseProductivity
      tipoProductividad: (data as any).tipoProductividad || 'Revistas',
      titulo: data.titulo,
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],

      // Campos propios de Revista
      issn: data.issn,
      volumen: data.volumen,
      fasc: data.fasc,
      paginas: data.paginas,
      responsable: data.responsable || [],
      linkDescargaArticulo: (data as any).linkDescargaArticulo || '',
      linksitioWeb: (data as any).linksitioWeb || '',
      image_url: data.image_r2 || ''
    });

    if (data.image_r2) {
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
   * Maneja cambio de texto en campo Responsables (separados por coma)
   */
  onResponsablesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    const responsable = value
      .split(',')
      .map(r => r.trim())
      .filter(r => r);

    this.form.patchValue({ responsable });
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
