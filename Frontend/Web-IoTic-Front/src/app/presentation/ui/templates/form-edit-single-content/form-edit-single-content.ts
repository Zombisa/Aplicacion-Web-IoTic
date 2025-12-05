import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-edit-single-content',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './form-edit-single-content.html',
  styleUrl: './form-edit-single-content.css'
})
export class FormEditSingleContent implements OnChanges {
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() isLoading: boolean = false;
  
  @Output() submitted = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  contentForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] && this.content !== undefined) {
      this.populateForm();
    }
  }

  private initializeForm(): void {
    this.contentForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private populateForm(): void {
    if (this.contentForm) {
      this.contentForm.patchValue({
        contenido: this.content || ''
      });
    }
  }

  onSubmit(): void {
    if (this.contentForm.valid) {
      this.submitted.emit(this.contentForm.get('contenido')?.value);
    } else {
      this.contentForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    this.contentForm.reset();
    this.populateForm();
  }
}


