import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroFotograficoDTO } from '../../../../models/DTO/RegistroFotograficoDTO';
import { RegistroFotograficoPeticion } from '../../../../models/Peticion/RegistroFotograficoPeticion';
import { RegistroFotograficoService } from '../../../../services/registro-fotografico.service';
import { ImagesService } from '../../../../services/common/images.service';
import { of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

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
    private registroService: RegistroFotograficoService,
    private imagesService: ImagesService
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
      fecha: [null],
      descripcion: ['', [Validators.maxLength(500)]],
      file_path: ['', this.modo === 'create' ? Validators.required : []]
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
     * Aquí solo guardamos un nombre de archivo en file_path para que pase la validación.
     * El file_path REAL lo devolvemos cuando subimos la imagen a R2 con URL firmada.
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

    // Validación extra: en create, obligamos a tener imagen
    if (this.modo === 'create' && !this.selectedFile) {
      this.form.get('file_path')?.setErrors({ required: true });
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    // 1. Si hay archivo seleccionado, lo subimos a R2
    // 2. Si no (modo edición sin cambiar imagen), usamos el file_path actual del form
    const filePath$ = this.selectedFile
      ? this.imagesService.uploadCompressedImage(this.selectedFile)
      : of(this.form.value.file_path);

    filePath$
      .pipe(
        switchMap((filePath: string) => {
          // Construimos el payload para el backend
          const payload: RegistroFotograficoPeticion = {
            titulo: this.form.value.titulo,
            fecha: this.form.value.fecha,
            descripcion: this.form.value.descripcion,
            file_path: filePath
          };

          // Según modo → create o update
          if (this.modo === 'create' || !this.id) {
            return this.registroService.create(payload);
          } else {
            return this.registroService.update(this.id, payload);
          }
        }),
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe({
        next: () => {
          this.saved.emit();

          // Si es create, limpiamos el form
          if (this.modo === 'create') {
            this.form.reset();
            this.selectedFile = null;
            this.imagePreviewUrl = null;
          }
        },
        error: (err) => {
          console.error('Error al guardar registro fotográfico:', err);
          // Aquí puedes mostrar un Swal o un error en pantalla
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
