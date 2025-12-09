import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { BookDTO } from '../../../../models/DTO/BookDTO';

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
      pais: ['', Validators.required],
      anio: ['', Validators.required],
      autores: [[], Validators.required],

      isbn: ['', Validators.required],
      volumen: [''],
      paginas: ['', Validators.required],
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
