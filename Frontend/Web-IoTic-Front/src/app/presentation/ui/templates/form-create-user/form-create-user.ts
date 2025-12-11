import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateUserDTO } from '../../../../services/users.service';

@Component({
  selector: 'app-form-create-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-create-user.html',
  styleUrl: './form-create-user.css'
})
export class FormCreateUser implements OnChanges {
  @Input() roles: { id: number; nombre: string }[] = [];
  @Output() submitted = new EventEmitter<CreateUserDTO>();
  @Output() cancelled = new EventEmitter<void>();

  userForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cuando los roles se cargan
    if (changes['roles'] && this.roles && this.roles.length > 0) {
      console.log('Roles recibidos en el formulario:', this.roles);
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', [Validators.required]],
      rol: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('contrasena');
    const confirmPassword = form.get('confirmarContrasena');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const createData: CreateUserDTO = {
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        email: formValue.email,
        contrasena: formValue.contrasena,
        rol: formValue.rol
      };
      this.submitted.emit(createData);
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  resetForm(): void {
    this.userForm.reset();
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsUntouched();
      this.userForm.get(key)?.markAsPristine();
    });
  }
}
