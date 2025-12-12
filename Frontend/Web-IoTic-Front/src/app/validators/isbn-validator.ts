import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador para ISBN
 * Debe ser numérico
 */
export function isbnValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  // Si está vacío, no validar aquí (dejar que Validators.required lo maneje)
  if (!value && value !== 0) {
    return null;
  }

  const stringValue = String(value).trim();
  
  // Debe ser solo números
  if (!/^\d+$/.test(stringValue)) {
    return { invalidIsbn: true };
  }
  
  return null;
}
