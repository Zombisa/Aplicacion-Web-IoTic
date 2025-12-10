import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { BookDTO } from '../../../../models/DTO/BookDTO';
import Swal from 'sweetalert2';
import { BooksService } from '../../../../services/information/books.service';

@Component({
  selector: 'app-form-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-book.html',
  styleUrls: ['./form-book.css']
})
export class FormBook implements OnInit {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del libro a editar */
  @Input() idInput!: number;
  bookData!: BookDTO;
  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder,
      private serviceBook: BooksService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit() {
    if (this.editMode && this.idInput) {
      this.cargarInfo();
    }
  }

  private cargarInfo() {
    this.serviceBook.getById(this.idInput).subscribe({
      next: (data) => {
        console.log(data);
        this.bookData = data;
        this.populateForm(this.bookData);
      },
      error: (err) => {
        console.error('Error al cargar el libro:', err);
      }
    }); 
  }
  private buildForm(): FormGroup {
    return this.fb.group({
      titulo: ['', Validators.required],
      tipoProductividad: ['Libro', Validators.required],
      pais: ['', [Validators.required, Validators.minLength(2)]],
      anio: ['', [Validators.required, Validators.min(0)]],
      autores: [[], Validators.required],
      isbn: ['', [Validators.required, Validators.minLength(1)]],
      volumen: ['', [Validators.required, Validators.min(1)]],
      paginas: ['', [Validators.required, Validators.min(1)]],
      editorial: ['', Validators.required],
      codigoEditorial: ['', Validators.required],
      propiedadIntelectual: ['', Validators.required],
      image_url: [''] // El padre la completa luego
    });
  }

  private populateForm(data: any) {
    this.form.patchValue({
      titulo: data.titulo,
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],
      isbn: data.isbn,
      volumen: data.volumen,
      paginas: data.paginas,
      editorial: data.editorial,
      codigoEditorial: data.codigoEditorial,
      propiedadIntelectual: data.propiedadIntelectual,
      imagePreview: data.image_r2 || ''
    });

    if (data.image_r2) {
      this.imagePreview = data.image_r2;
    }

  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  /**
   * Captura el archivo de documento seleccionado
   * Valida el tamaño máximo de 20 MB
   */
  onDocumentSelected(event: any) {
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

  removeFile() {
    this.selectedDocument = null;
  }

  private resetForm() {
    this.form.reset();
    this.selectedFile = null;
    this.imagePreview = null;
  }

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
