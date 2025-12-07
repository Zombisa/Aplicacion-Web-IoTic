import { ItemDTO } from './ItemDTO';

export interface LoanDTOConsultById {
  id: number;
  item: number | ItemDTO; // Puede ser el ID o el objeto completo del item
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
