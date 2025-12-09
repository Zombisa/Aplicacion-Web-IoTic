import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { TrabajoEventosDTO } from '../../../../models/DTO/informacion/TrabajoEventosDTO';

@Component({
  selector: 'app-form-trabajo-eventos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-trabajo-eventos.html',
  styleUrls: ['./form-trabajo-eventos.css']
})
export class FormTrabajoEventos implements OnChanges {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();
  @Input() editMode: boolean = false;
  @Input() data!: TrabajoEventosDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.editMode && this.data) {
      this.populateForm(this.data);
    }
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      titulo: ['', Validators.required],
      tipoProductividad: ['Trabajo en Evento', Validators.required],
      volumen: ['', Validators.required],
      nombreSeminario: ['', Validators.required],
      tipoPresentacion: ['', Validators.required],
      tituloActas: ['', Validators.required],
      isbn: ['', Validators.required],
      paginas: ['', Validators.required],
      anio: ['', Validators.required],
      etiquetas: [[]],
      autores: [[]],
      propiedadIntelectual: ['', Validators.required],
      image_url: ['']
    });
  }

  private populateForm(data: TrabajoEventosDTO) {
    this.form.patchValue({
      titulo: data.titulo,
      volumen: data.volumen,
      nombreSeminario: data.nombreSeminario,
      tipoPresentacion: data.tipoPresentacion,
      tituloActas: data.tituloActas,
      isbn: data.isbn,
      paginas: data.paginas,
      anio: data.anio,
      etiquetas: data.etiquetas || [],
      autores: data.autores || [],
      propiedadIntelectual: data.propiedadIntelectual,
      image_url: data.image_r2 || ''
    });

    if (data.image_r2) {
      this.imagePreview = data.image_r2;
    }
  }

  onAutoresChange(value: string) {
    const autores = value.split(',').map(a => a.trim()).filter(a => a);
    this.form.patchValue({ autores });
  }

  onEtiquetasChange(value: string) {
    const etiquetas = value.split(',').map(e => e.trim()).filter(e => e);
    this.form.patchValue({ etiquetas });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

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
