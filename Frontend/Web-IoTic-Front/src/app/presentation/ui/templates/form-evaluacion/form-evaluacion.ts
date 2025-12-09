import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSubmitPayload } from '../../../../models/Common/FormSubmitPayload';
import { ParticipacionComitesEvDTO } from '../../../../models/DTO/informacion/ParticipacionComitesEvDTO';

@Component({
    selector: 'app-form-evaluacion',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './form-evaluacion.html',
    styleUrls: ['./form-evaluacion.css']
})
export class FormEvaluacion implements OnChanges {

    @Output() formSubmit = new EventEmitter<FormSubmitPayload>();

    /** Modo editar */
    @Input() editMode: boolean = false;

    /** Datos a editar */
    @Input() evaluationData!: ParticipacionComitesEvDTO;

    form: FormGroup;
    selectedFile: File | null = null;
    imagePreview: string | null = null;

    constructor(private fb: FormBuilder) {
        this.form = this.buildForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.editMode && this.evaluationData) {
            this.populateForm(this.evaluationData);
        }
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
            autores: [[], Validators.required],

            // Campos propios
            institucion: ['', Validators.required],
            etiquetasGTI: [[], Validators.required],
            licencia: ['', Validators.required],

            // la completa el padre cuando sube la imagen
            image_url: ['']
        });
    }

    /**
     * Llena el formulario con los datos existentes
     */
    private populateForm(data: ParticipacionComitesEvDTO): void {
        this.form.patchValue({
            titulo: data.titulo,
            pais: data.pais,
            anio: data.anio,
            autores: data.autores || [],
            institucion: data.institucion,
            etiquetasGTI: data.etiquetasGTI || [],
            licencia: data.licencia,
            image_url: (data as any).image_url || data.image_r2 || ''
        });

        if ((data as any).image_url || data.image_r2) {
            this.imagePreview = (data as any).image_url || data.image_r2!;
        }
    }

    /**
     * Captura el archivo seleccionado y genera un preview
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
     * Envía el formulario al componente padre
     */
    submitForm(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload: FormSubmitPayload = {
            data: this.form.value,
            file_image: this.selectedFile
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
