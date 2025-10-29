export interface PrestamoForm {
  electronicComponentId: number | null;
  usuario: string;
  cantidad: number;
  tipo: 'PRESTAMO' | 'DEVOLUCION';
}

export interface RegistroPrestamo {
  id: number;
  electronicComponentId: number;
  usuario: string;
  cantidad: number;
  fecha: string;
  devuelto: boolean;
}
