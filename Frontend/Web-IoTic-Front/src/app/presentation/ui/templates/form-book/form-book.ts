import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-book.html',
  styleUrl: './form-book.css'
})
export class FormBook {

  @Output() formSubmit = new EventEmitter<any>();

  form: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      tipoProductividad: ['book', Validators.required],
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
   * Caputura el archivo seleccionado y genera un preview
   * @param event archivo seleccionado
   * @returns 
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
   * Envia el formulario al componente padre
   * @returns Emite el valor del formulario y el archivo seleccionado
   */
  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit({
      data: this.form.value,
      file: this.selectedFile
    });
  }
}
