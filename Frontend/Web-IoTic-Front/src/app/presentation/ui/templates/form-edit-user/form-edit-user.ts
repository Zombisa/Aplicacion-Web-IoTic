import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { UpdateUserDTO } from '../../../../services/users.service';

@Component({
  selector: 'app-form-edit-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-edit-user.html',
  styleUrl: './form-edit-user.css'
})
export class FormEditUser implements OnChanges, OnInit {
  @Input() user?: UserDTO;
  @Input() roles: { id: number; nombre: string }[] = [];
  @Output() submitted = new EventEmitter<UpdateUserDTO>();
  @Output() cancelled = new EventEmitter<void>();

  userForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.populateForm();
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required]
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.userForm.patchValue({
        nombre: this.user.nombre || '',
        apellido: this.user.apellido || '',
        email: this.user.email || '',
        rol: this.user.rol || ''
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const updateData: UpdateUserDTO = {
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        email: formValue.email,
        rol: formValue.rol
      };
      this.submitted.emit(updateData);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  resetForm(): void {
    this.populateForm();
  }
}




