import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador personalizado para verificar que un campo contenga una URL válida
 * @param control - Control del formulario que contiene la URL a validar
 * @returns Si la URL no es válida, retorna un objeto de error { invalidUrl: true },
 *          de lo contrario retorna null
 */
export function urlValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  // Si está vacío, no validar aquí (dejar que Validators.required lo maneje)
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Convertir a string si no lo es
  const stringValue = String(value).trim();
  
  // Patrón básico para validar que tenga al menos un dominio válido
  // Debe contener al menos un punto y caracteres alfanuméricos
  const basicUrlPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/;
  
  // Si no tiene formato básico de dominio, rechazar inmediatamente
  if (!basicUrlPattern.test(stringValue) && !stringValue.startsWith('http://') && !stringValue.startsWith('https://')) {
    return { invalidUrl: true };
  }
  
  // Intentar crear un objeto URL para validación más estricta
  try {
    // Si no tiene protocolo, agregar temporalmente http:// para validar
    const urlToValidate = stringValue.startsWith('http://') || stringValue.startsWith('https://') 
      ? stringValue 
      : `http://${stringValue}`;
    
    new URL(urlToValidate);
    return null; // URL válida
  } catch (error) {
    // Si falla la creación del objeto URL, retornar error
    return { invalidUrl: true };
  }
}
