import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador para ISSN
 * Debe ser numérico y máximo 8 dígitos
 */
export function issnValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  // Si está vacío, no validar aquí (dejar que Validators.required lo maneje)
  if (!value && value !== 0) {
    return null;
  }

  const stringValue = String(value).trim();
  
  // Debe ser solo números
  if (!/^\d+$/.test(stringValue)) {
    return { invalidIssn: true };
  }
  
  // Debe tener máximo 8 dígitos
  if (stringValue.length > 8) {
    return { invalidIssn: true };
  }
  
  return null;
}
