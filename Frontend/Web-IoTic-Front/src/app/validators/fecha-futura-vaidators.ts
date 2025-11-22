import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 *   
 * Validador personalizado para verificar que una fecha sea futura
 * se debe de importar dentro del componete donde se va a usar
 * @param control - Control del formulario que contiene la fecha a validar
 * @returns  null si la fecha es futura, o un objeto de error si no lo es
 */
export function fechaFuturaValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;

  const fechaIngresada = new Date(valor);
  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);
  fechaIngresada.setHours(0, 0, 0, 0);

  return fechaIngresada > hoy ? null : { fechaNoFutura: true };
}
