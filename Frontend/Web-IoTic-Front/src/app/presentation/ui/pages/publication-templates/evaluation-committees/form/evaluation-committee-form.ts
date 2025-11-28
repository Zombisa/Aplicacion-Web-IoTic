import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EvaluationCommitteeDTO } from '../../../../../../models/DTO/evaluation-committeeDTO'; // ✅ Importa ambos
import { EvaluationCommitteePeticion } from '../../../../../../models/Peticion/evaluation-committeePeticion';

@Component({
  selector: 'app-evaluation-committee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './evaluation-committee-form.html',
  styleUrls: ['./evaluation-committee-form.css']
})
export class EvaluationCommitteeForm implements OnInit {
  @Input() initialValue?: EvaluationCommitteeDTO;
  @Input() disabled: boolean = false;
  @Output() save = new EventEmitter<EvaluationCommitteePeticion>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: [this.initialValue?.titulo || '', [Validators.required, Validators.maxLength(100)]],
      pais: [this.initialValue?.pais || '', [Validators.required, Validators.maxLength(50)]],
      anio: [this.initialValue?.anio || new Date().getFullYear(),
      [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      institucion: [this.initialValue?.institucion || '', [Validators.required, Validators.maxLength(100)]],
      tipoProductividad: [this.initialValue?.tipoProductividad || '', Validators.required],
      licencia: [this.initialValue?.licencia || '', Validators.required],
      autores: this.fb.array(this.initialValue?.autores || ['']),
      etiquetasGTI: this.fb.array(this.initialValue?.etiquetasGTI || []),
    });

    if (!this.initialValue?.autores || this.initialValue.autores.length === 0) {
      this.addAutor();
    }

    this.updateFormState();
  }

  ngOnChanges(): void {
    if (this.form) {
      this.updateFormState();
    }
  }

  private updateFormState(): void {
    if (this.disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  get autores(): FormArray {
    return this.form.get('autores') as FormArray;
  }

  get etiquetasGTI(): FormArray {
    return this.form.get('etiquetasGTI') as FormArray;
  }

  addAutor(value: string = '') {
    this.autores.push(this.fb.control(value, Validators.required));
  }

  removeAutor(index: number) {
    if (this.autores.length > 1) {
      this.autores.removeAt(index);
    }
  }

  addEtiqueta(value: string = '') {
    this.etiquetasGTI.push(this.fb.control(value, Validators.required));
  }

  removeEtiqueta(index: number) {
    this.etiquetasGTI.removeAt(index);
  }

  submit() {
    if (this.form.invalid || this.disabled) { 
      this.markAllAsTouched();
      return;
    }

    const formData: EvaluationCommitteePeticion = {
      titulo: this.form.value.titulo,
      pais: this.form.value.pais,
      anio: this.form.value.anio,
      institucion: this.form.value.institucion,
      tipoProductividad: this.form.value.tipoProductividad,
      licencia: this.form.value.licencia,
      autores: this.form.value.autores.filter((autor: string) => autor.trim() !== ''),
      etiquetasGTI: this.form.value.etiquetasGTI.filter((etiqueta: string) => etiqueta.trim() !== '')
    };

    this.save.emit(formData);
  }

  private markAllAsTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control instanceof FormGroup) {
        control.markAllAsTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }
}