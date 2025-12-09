import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { BookDTO } from '../../../../models/DTO/BookDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-book.html',
  styleUrls: ['./form-book.css']
})
export class FormBook implements OnChanges {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

  /** Modo editar */
  @Input() editMode: boolean = false;

  /** Datos del libro a editar */
  @Input() bookData!: BookDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.buildForm();
  }

  /**
   * Detecta cambios en los inputs
   */
  ngOnChanges(changes: SimpleChanges) {
    if (this.editMode && this.bookData) {
      this.populateForm(this.bookData);
    }
  }

  /**
   * Construye el formulario reactivo para libros
   */
  private buildForm(): FormGroup {
    return this.fb.group({
      titulo: ['', Validators.required],
      tipoProductividad: ['Libro', Validators.required],
      pais: ['', Validators.required, Validators.minLength(2)],
      anio: ['', Validators.required, Validators.min(0)],
      autores: [[], Validators.required],

      isbn: ['', Validators.required, Validators.minLength(1)],
      volumen: ['' ,Validators.required, Validators.min(1)],
      paginas: ['', Validators.required, Validators.min(1)],
      editorial: ['', Validators.required],
      codigoEditorial: ['', Validators.required],
      propiedadIntelectual: ['', Validators.required],

      image_url: [''] // El padre la completa luego
    });
  }

  /**
   * Llena el formulario con los datos del libro
   * @param data datos del libro a editar
   */
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
      image_url: data.image_url || ''
    });

    // Si trae imagen, mostrar preview
    if (data.image_url) {
      this.imagePreview = data.image_url;
    }
  }

  /**
   * Captura el archivo seleccionado y genera un preview
   */
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
   * valida el tamaño máximo de 20 MB 
   * @param event evento del input file
   * @returns 
   */
  onDocumentSelected(event: any) {
    const file = event.target.files[0];
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
  /**
   * Resetea el formulario
   */
  private resetForm() {
    this.form.reset();
    this.selectedFile = null;
    this.imagePreview = null;
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
      file_image: this.selectedFile
    };
    this.formSubmit.emit(dtoSubmit);
  }
}

