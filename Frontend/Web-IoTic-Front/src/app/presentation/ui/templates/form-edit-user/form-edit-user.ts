import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Si el usuario ya está disponible al inicializar, poblar el formulario
    if (this.user) {
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el usuario, actualizar el formulario
    if (changes['user'] && this.user) {
      // Usar setTimeout para asegurar que Angular haya procesado el cambio
      setTimeout(() => {
        this.populateForm();
        this.cdr.detectChanges();
      }, 0);
    }
    // Si los roles cambian y hay un usuario, actualizar el formulario (especialmente el rol)
    if (changes['roles'] && this.roles.length > 0 && this.user) {
      setTimeout(() => {
        this.populateForm();
        this.cdr.detectChanges();
      }, 0);
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
    if (this.user && this.userForm) {
      // Mapear el rol del usuario al nombre del rol (el formulario usa el nombre)
      const userRol = this.user.rol || '';
      
      this.userForm.patchValue({
        nombre: this.user.nombre || '',
        apellido: this.user.apellido || '',
        email: this.user.email || '',
        rol: userRol
      }, { emitEvent: false });
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
    if (this.userForm) {
      // Resetear valores al estado original del usuario
      this.populateForm();
      
      // Limpiar el estado de validación de todos los controles
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control) {
          control.markAsUntouched();
          control.markAsPristine();
          control.setErrors(null);
        }
      });
    }
  }
}




