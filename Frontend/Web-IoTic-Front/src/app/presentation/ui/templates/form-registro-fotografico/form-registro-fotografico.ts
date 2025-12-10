import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroFotograficoDTO } from '../../../../models/DTO/RegistroFotograficoDTO';
import { RegistroFotograficoPeticion } from '../../../../models/Peticion/RegistroFotograficoPeticion';
import { RegistroFotograficoService } from '../../../../services/registro-fotografico.service';

@Component({
  selector: 'app-form-registro-fotografico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-registro-fotografico.html',
  styleUrls: ['./form-registro-fotografico.css']
})
export class FormRegistroFotografico implements OnInit {

  /** 'create' para nuevo, 'edit' para edición */
  @Input() modo: 'create' | 'edit' = 'create';

  /** id del registro cuando estás en modo edición */
  @Input() id: number | null = null;

  /** Evento que el padre escucha cuando se guarda correctamente */
  @Output() saved = new EventEmitter<void>();

  /** Evento para cancelar y volver atrás */
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  loading: boolean = false;
  saving: boolean = false;

  /** Archivo seleccionado para la foto */
  selectedFile: File | null = null;

  /** URL para previsualizar la imagen (nueva o existente) */
  imagePreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroFotograficoService
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.modo === 'edit' && this.id != null) {
      this.cargarRegistro(this.id);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      fecha: [null], // puedes agregar Validators.required si lo necesitas
      descripcion: ['', [Validators.maxLength(500)]],
      file_path: ['', this.modo === 'create' ? Validators.required : []] // requerido al crear
    });
  }

  private cargarRegistro(id: number): void {
    this.loading = true;
    this.registroService.getById(id).subscribe({
      next: (registro: RegistroFotograficoDTO) => {
        this.form.patchValue({
          titulo: registro.titulo,
          fecha: registro.fecha,
          descripcion: registro.descripcion,
          // el file_path lo dejamos vacío porque no enviamos el URL completo
        });

        // mostramos la imagen que ya viene del backend
        this.imagePreviewUrl = registro.foto_r2;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /** Cuando el usuario selecciona una imagen */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];
    this.selectedFile = file;

    // Solo para preview en el front
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    /**
     * IMPORTANTE:
     * Aquí solo guardamos un nombre de archivo en file_path para tener algo.
     * Cuando conectes el flujo de URL firmada + subida a R2,
     * deberías remplazar esto por el `key`/`file_path` que te devuelva el backend.
     */
    this.form.get('file_path')?.setValue(file.name);
    this.form.get('file_path')?.markAsDirty();
  }

  /** Submit del formulario */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    // Construimos el payload para el backend
    const payload: RegistroFotograficoPeticion = {
      titulo: this.form.value.titulo,
      fecha: this.form.value.fecha,
      descripcion: this.form.value.descripcion,
      file_path: this.form.value.file_path
    };

    /**
     * NOTA:
     * Por ahora esto solo envía el `file_path` tal cual.
     * Cuando conectemos la subida a R2, antes de llamar a create/update
     * tendrás que:
     *  1. Pedir URL firmada al backend.
     *  2. Hacer PUT del archivo a esa URL.
     *  3. Usar el `file_path` correcto en este payload.
     */

    const request$ =
      this.modo === 'create' || this.id == null
        ? this.registroService.create(payload)
        : this.registroService.update(this.id, payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
        if (this.modo === 'create') {
          this.form.reset();
          this.selectedFile = null;
          this.imagePreviewUrl = null;
        }
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Helpers para el template
  hasError(controlName: string, error: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(error);
  }
}
