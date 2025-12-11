import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { ParticipacionComitesEvDTO } from '../../../../models/DTO/informacion/ParticipacionComitesEvDTO';
import { ParticipacionComitesEvService } from '../../../../services/information/participacion-comites-ev.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-form-evaluacion',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './form-evaluacion.html',
    styleUrls: ['./form-evaluacion.css']
})
export class FormEvaluacion implements OnInit{

    @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

    /** Modo editar */
    @Input() editMode: boolean = false;

    /** Datos a editar */
    @Input() idInput!: number;
    evaluationData!: ParticipacionComitesEvDTO;

    form: FormGroup;
    selectedFile: File | null = null;
    selectedDocument: File | null = null;
    imagePreview: string | null = null;
    existingDocumentName: string | null = null;

    constructor(private fb: FormBuilder,
        private serviceEvaluation: ParticipacionComitesEvService
    ) {
        this.form = this.buildForm();
    }
    ngOnInit(): void {
        if (this.editMode && this.idInput) {
            this.cargarInfo();
        }
    }

    private cargarInfo() {
        this.serviceEvaluation.getById(this.idInput).subscribe({
            next: (data) => {
                console.log(data);
                this.evaluationData = data;
                this.populateForm(this.evaluationData);
            },
            error: (err) => {
                console.error('Error al cargar la participación en comités de evaluación:', err);
            }
        }); 
    }   

    /**
     * Construye el formulario reactivo para participación en comités de evaluación
     */
    private buildForm(): FormGroup {
        return this.fb.group({
            // BaseProductivity
            titulo: ['', Validators.required],
            tipoProductividad: ['Participación en comités de evaluación', Validators.required],
            pais: ['', Validators.required],
            anio: ['', Validators.required],
            autoresString: ['', Validators.required],

            // Campos propios
            institucion: ['', Validators.required],
            etiquetasGTIString: ['', Validators.required],
            licencia: ['', Validators.required],

            // la completa el padre cuando sube la imagen
            image_url: ['']
        });
    }

    /**
     * Llena el formulario con los datos existentes
     */
    private populateForm(data: ParticipacionComitesEvDTO): void {
        // Convertir arrays de autores y etiquetas a strings separados por coma
        const autoresString = (data.autores && Array.isArray(data.autores))
            ? data.autores.join(', ')
            : '';

        const etiquetasGTIString = (data.etiquetasGTI && Array.isArray(data.etiquetasGTI))
            ? data.etiquetasGTI.join(', ')
            : '';

        this.form.patchValue({
            titulo: data.titulo,
            tipoProductividad: data.tipoProductividad || 'Participación en comités de evaluación',
            pais: data.pais,
            anio: data.anio,
            autoresString: autoresString,
            autores: data.autores || [],
            institucion: data.institucion,
            etiquetasGTIString: etiquetasGTIString,
            etiquetasGTI: data.etiquetasGTI || [],
            licencia: data.licencia,
            image_url: data.image_r2 || ''
        });

        if (data.image_r2) {
            this.imagePreview = data.image_r2!;
        }

        // Si existe un archivo, mostrar que ya hay documento
        if (data.file_r2) {
            this.existingDocumentName = data.file_r2!;
        }
    }

    /**
     * Captura el archivo de imagen seleccionado y genera un preview
     */
    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (!file) return;

        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = () => (this.imagePreview = reader.result as string);
        reader.readAsDataURL(file);
    }

    /**
     * Captura el archivo documento seleccionado
     */
    onDocumentSelected(event: any): void {
        const file = event.target.files[0];
        if (!file) return;
        this.selectedDocument = file;
    }

    /**
     * Elimina el documento seleccionado
     */
    removeFile(): void {
        if (this.existingDocumentName) {
            this.existingDocumentName = null;
        } else {
            this.selectedDocument = null;
        }
    }

    /**
     * Envía el formulario al componente padre
     */
    submitForm(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        // Si estamos en modo edición y el usuario removió el documento existente
        if (this.editMode && !this.existingDocumentName && this.evaluationData.file_r2) {
            this.serviceEvaluation.deleteFile(this.evaluationData.id!).subscribe({
                next: () => this.emitirFormulario(),
                error: (err: any) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo eliminar el documento'
                    });
                }
            });
        } else {
            this.emitirFormulario();
        }
    }

    /**
     * Emite el formulario con los datos convertidos
     */
    private emitirFormulario(): void {
        // Preparar datos
        const formData = { ...this.form.value };
        
        // Convertir autoresString a array si aún es string
        if (typeof formData.autoresString === 'string') {
            formData.autores = formData.autoresString
                .split(',')
                .map((a: string) => a.trim())
                .filter((a: string) => a);
        }

        // Convertir etiquetasGTIString a array si aún es string
        if (typeof formData.etiquetasGTIString === 'string') {
            formData.etiquetasGTI = formData.etiquetasGTIString
                .split(',')
                .map((e: string) => e.trim())
                .filter((e: string) => e);
        }
        
        // Remover los campos string ya que no los necesitamos en la petición
        delete formData.autoresString;
        delete formData.etiquetasGTIString;
        
        const payload: FormSubmitPayload = {
            data: formData,
            file_image: this.selectedFile,
            file_document: this.selectedDocument
        };

        this.formSubmit.emit(payload);
    }

    onAutoresChange(value: string): void {
        const autores = value
            .split(',')
            .map(a => a.trim())
            .filter(a => a);

        this.form.patchValue({ autores });
    }

    onEtiquetasChange(value: string): void {
        const etiquetasGTI = value
            .split(',')
            .map(e => e.trim())
            .filter(e => e);

        this.form.patchValue({ etiquetasGTI });
    }
}
