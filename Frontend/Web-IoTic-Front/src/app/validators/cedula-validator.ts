import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador para cédula
 * Debe ser numérico de 6 a 10 dígitos
 */
export function cedulaValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  // Si está vacío, no validar aquí (dejar que Validators.required lo maneje)
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value).trim();
  
  // Debe ser solo números
  if (!/^\d+$/.test(stringValue)) {
    return { invalidCedula: true };
  }
  
  // Debe tener entre 6 y 10 dígitos
  if (stringValue.length < 6 || stringValue.length > 10) {
    return { invalidCedula: true };
  }
  
  return null;
}
