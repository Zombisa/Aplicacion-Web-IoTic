import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 *   
 * Validador personalizado para verificar que una fecha sea futura
 * se debe de importar dentro del componete donde se va a usar
 * @param control - Control del formulario que contiene la fecha a validar
 * @returns  si la fecha es pasada, retorna un objeto de error { fechaPasada: true },
 */
export function fechaFuturaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null; // Si está vacío, no validar aquí

  const inputDate = new Date(control.value);
  const today = new Date();

  // Solo comparar año, mes y día (ignorar horas)
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  // Si la fecha es menor que hoy, retornar error
  return inputDate < today ? { fechaPasada: true } : null;
}
