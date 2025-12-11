import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { CursoDTO } from '../../../../models/DTO/informacion/CursoDTO';
import { CursoService } from '../../../../services/information/curso.service';

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
      autores: [[], Validators.required],

      // Campos propios de Curso
      etiquetasString: ['', Validators.required],
      etiquetas: [[], Validators.required],
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
      autores: data.autores || [],
      etiquetasString: etiquetasString,
      etiquetas: data.etiquetas || [],
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
    
    // Preparar datos: convertir strings a arrays si es necesario
    const formData = { ...this.form.value };
    
    // Si los valores de autores y etiquetas aún son strings, convertirlos
    if (typeof formData.autores === 'string') {
      formData.autores = formData.autores
        .split(',')
        .map((a: string) => a.trim())
        .filter((a: string) => a);
    }
    if (typeof formData.etiquetas === 'string') {
      formData.etiquetas = formData.etiquetas
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

