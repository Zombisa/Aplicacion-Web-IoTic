export interface PrestamoForm {
  electronicComponentId: number | null;
  usuario: string;
  cantidad: number;
  tipo: 'PRESTAMO' | 'DEVOLUCION';
  diasPrestamo?: number;
}

export interface RegistroPrestamo {
  id: number;
  electronicComponentId: number;
  usuario: string;
  cantidad: number;
  fechaPrestamo: string;
  fechaFinalizacion: string;
  fechaDevolucion?: string;
  diasPrestamo: number;
  devuelto: boolean;
  vencido: boolean;
}
