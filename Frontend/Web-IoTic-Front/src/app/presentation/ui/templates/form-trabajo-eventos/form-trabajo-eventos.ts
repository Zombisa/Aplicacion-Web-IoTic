import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { TrabajoEventosDTO } from '../../../../models/DTO/informacion/TrabajoEventosDTO';
import { TrabajoEventosService } from '../../../../services/information/trabajo-eventos.service';

@Component({
  selector: 'app-form-trabajo-eventos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-trabajo-eventos.html',
  styleUrls: ['./form-trabajo-eventos.css']
})
export class FormTrabajoEventos implements OnInit {

  @Output() formSubmit = new EventEmitter<FormSubmitPayload>();
  @Input() editMode: boolean = false;
  @Input() data!: TrabajoEventosDTO;

  form: FormGroup;
  selectedFile: File | null = null;
  selectedDocument: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder,
    private serviceTrabajoEventos: TrabajoEventosService
  ) {
    this.form = this.buildForm();
  }
  ngOnInit(): void {
    if (this.editMode && this.data) {
      this.cargarInfo();
    }
  }
  private cargarInfo() {  
    this.serviceTrabajoEventos.getById(this.data.id!).subscribe({  
      next: (data) => {     
        console.log(data);
        this.data = data;
        this.populateForm(this.data);
      },
      error: (err) => {
        console.error('Error al cargar el trabajo en evento:', err);
      }
    }); 
  }



  private buildForm(): FormGroup {
    return this.fb.group({
      // BaseProductivity
      titulo: ['', Validators.required],
      tipoProductividad: ['Trabajo en Evento', Validators.required],
      pais: ['', Validators.required],
      anio: ['', Validators.required],
      autores: [[], Validators.required],

      // Campos propios de TrabajoEventos
      volumen: ['', Validators.required],
      nombreSeminario: ['', Validators.required],
      tipoPresentacion: ['', Validators.required],
      tituloActas: ['', Validators.required],
      isbn: ['', Validators.required],
      paginas: ['', Validators.required],
      etiquetas: [[]],
      propiedadIntelectual: ['', Validators.required],
      image_url: ['']
    });
  }

  private populateForm(data: TrabajoEventosDTO) {
    this.form.patchValue({
      // BaseProductivity
      titulo: data.titulo,
      tipoProductividad: data.tipoProductividad || 'Trabajo en Evento',
      pais: data.pais,
      anio: data.anio,
      autores: data.autores || [],

      // Campos propios de TrabajoEventos
      volumen: data.volumen,
      nombreSeminario: data.nombreSeminario,
      tipoPresentacion: data.tipoPresentacion,
      tituloActas: data.tituloActas,
      isbn: data.isbn,
      paginas: data.paginas,
      etiquetas: data.etiquetas || [],
      propiedadIntelectual: data.propiedadIntelectual,
      image_url:  data.image_r2 || ''
    });

    if ( data.image_r2) {
      this.imagePreview =  data.image_r2!;
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

  onDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedDocument = file;
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
