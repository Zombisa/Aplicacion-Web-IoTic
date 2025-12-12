import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador para teléfono
 * Debe ser numérico de exactamente 10 dígitos
 */
export function telefonoValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  // Si está vacío, no validar aquí (dejar que Validators.required lo maneje)
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value).trim();
  
  // Debe ser solo números
  if (!/^\d+$/.test(stringValue)) {
    return { invalidTelefono: true };
  }
  
  // Debe tener exactamente 10 dígitos
  if (stringValue.length !== 10) {
    return { invalidTelefono: true };
  }
  
  return null;
}
