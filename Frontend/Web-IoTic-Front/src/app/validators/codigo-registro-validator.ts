import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador para código de registro de software
 * Formato esperado: DERAUTOR:XXX-XXX
 */
export function codigoRegistroValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  // Si está vacío, no validar aquí (dejar que Validators.required lo maneje)
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const stringValue = String(value).trim();
  
  // Patrón: DERAUTOR:XXX-XXX donde XXX son números
  const pattern = /^DERAUTOR:\d{3}-\d{3}$/;
  
  if (!pattern.test(stringValue)) {
    return { invalidCodigoRegistro: true };
  }
  
  return null;
}
