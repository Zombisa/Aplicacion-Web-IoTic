export interface LoanDTOConsultById {
  id: number;
  item: number;
  nombre_persona: string;
  cedula: string;
  telefono: string;
  correo: string;
  direccion: string;
  fecha_prestamo: string;      
  fecha_limite: string;        
  fecha_devolucion: string | null;  
  estado: 'Prestado' | 'Devuelto' | 'No prestado'; 
}
