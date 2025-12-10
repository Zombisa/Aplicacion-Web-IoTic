import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Header } from '../header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { BookDTO } from '../../../../models/DTO/BookDTO';
import { CapBookDTO } from '../../../../models/DTO/CapBookDTO';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CapBookService } from '../../../../services/information/cap-book.service';

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
      pais: ['', Validators.required],
      anio: [''  ,Validators.required],
      autores: [[], Validators.required],
      isbn: ['' ,Validators.required],
      volumen: ['', Validators.required],
      paginasFin: ['', Validators.required, Validators.min(0)],
      paginaInicio: ['', Validators.required, Validators.min(0)],
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
    this.form.patchValue({
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad,
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],
      isbn: data.isbn,
      volumen: data.volumen,
      paginasFin: data.paginasFin,
      paginaInicio: data.paginaInicio,
      editorial: data.editorial,
      codigoEditorial: data.codigoEditorial,
      propiedadIntelectual: data.propiedadIntelectual,
      imagePreview:  data.image_r2 || '',
    });

    // Si trae imagen, mostrar preview
    if (data.image_r2) {
      this.imagePreview = data.image_r2!;
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
   * Envía el formulario al componente padre
   */
  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dtoSubmit: FormSubmitPayload = {
      data: this.form.value,
      file_image: this.selectedFile,
      file_document: this.selectedDocument
    };
    this.formSubmit.emit(dtoSubmit);
  }
}
