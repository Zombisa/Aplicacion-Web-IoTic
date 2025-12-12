import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Header } from '../header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { BookDTO } from '../../../../models/DTO/BookDTO';
import { CapBookDTO } from '../../../../models/DTO/CapBookDTO';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CapBookService } from '../../../../services/information/cap-book.service';
import { isbnValidator } from '../../../../validators/isbn-validator';

@Component({
  selector: 'app-form-cap-book',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-cap-book.html',
  styleUrl: './form-cap-book.css',
})
export class FormCapBook implements OnInit{

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del libro a editar */
  @Input() idInput!: number;
  bookData!: CapBookDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;
  existingDocumentName: string | null = null;
  
  constructor(private fb: FormBuilder,
    private serviceCapBook: CapBookService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit(): void {
    if (this.editMode && this.idInput) {
      this.cargarInfo();
    }
  }
  private cargarInfo() {
    this.serviceCapBook.getById(this.idInput).subscribe({
      next: (data) => {
        console.log(data);
        this.bookData = data;
        this.populateForm(this.bookData);
      },
      error: (err) => {
        console.error('Error al cargar el capítulo de libro:', err);
      }
    }); 
  }

  /**
   
   * 
   * @returns Construye el formulario reactivo para capítulos de libros
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      titulo: ['', Validators.required],
      tipoProductividad: ['Capitulo de libros'],
      anio: ['', Validators.required],
      autoresString: ['', Validators.required],
      isbn: ['', [Validators.required, isbnValidator]],
      volumen: ['', Validators.required],
      paginasFin: [null, [Validators.required, Validators.min(0)]],
      paginaInicio: [null, [Validators.required, Validators.min(0)]],
      editorial: ['', Validators.required],
      codigoEditorial: ['', Validators.required],
      propiedadIntelectual: ['', Validators.required],
      image_url: [''], // El padre la completa luego cuando sube la imagen
    });
  }
  /**
   * 
   * @param data datos del capítulo de libro a cargar en el formulario
   */
  private populateForm(data: CapBookDTO) {
    console.log('Datos a popular:', data);
    
    // Convertir array de autores a string separado por coma
    const autoresString = (data.autores && Array.isArray(data.autores))
      ? data.autores.join(', ')
      : '';

    this.form.patchValue({
      titulo: data.titulo || '',
      tipoProductividad: data.tipoProductividad || 'Capitulo de libros',
      anio: data.anio || '',
      autoresString: autoresString,
      autores: data.autores || [],
      isbn: data.isbn || '',
      volumen: data.volumen || '',
      paginasFin: data.paginasFin || null,
      paginaInicio: data.paginaInicio || null,
      editorial: data.editorial || '',
      codigoEditorial: data.codigoEditorial || '',
      propiedadIntelectual: data.propiedadIntelectual || '',
      image_url: data.image_r2 || '',
    });

    console.log('Formulario después de patchValue:', this.form.value);

    // Si trae imagen, mostrar preview
    if (data.image_r2) {
      this.imagePreview = data.image_r2!;
    }

    // Si trae documento existente
    if ((data as any).file_r2) {
      this.existingDocumentName = (data as any).file_r2;
    }
  }
  /**
   * Captura el archivo de imagen seleccionado y genera un preview
   * @param event Evento del input file
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Captura el archivo documento seleccionado
   */
  onDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedDocument = file;
  }

  /**
   * Elimina el documento seleccionado o existente
   */
  removeFile() {
    if (this.existingDocumentName) {
      this.existingDocumentName = null;
    } else {
      this.selectedDocument = null;
    }
  }

   /**
   * Envía el formulario al componente padre
   */
  submitForm() {
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
    
    // Remover el campo string de autores ya que no lo necesitamos en la petición
    delete formData.autoresString;
    
    const dtoSubmit: FormSubmitPayload = {
      data: formData,
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };
    this.formSubmit.emit(dtoSubmit);
  }
}
