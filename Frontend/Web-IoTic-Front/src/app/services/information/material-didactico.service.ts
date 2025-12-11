import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/api.service';
import { MaterialDidacticoDTO } from '../../models/DTO/informacion/MaterialDidacticoDTO';
import { MaterialDidacticoPeticion } from '../../models/Peticion/informacion/MaterialDidacticoPeticion';

@Injectable({
  providedIn: 'root'
})
export class MaterialDidacticoService {

  private readonly basePath = 'informacion/materialDidactico';

  constructor(private api: ApiService) {}

  getAll(): Observable<MaterialDidacticoDTO[]> {
    return this.api.get<MaterialDidacticoDTO[]>(`${this.basePath}/`);
  }

  getById(id: number): Observable<MaterialDidacticoDTO> {
    return this.api.get<MaterialDidacticoDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: MaterialDidacticoPeticion): Observable<MaterialDidacticoDTO> {
    return this.api.post<MaterialDidacticoDTO>(`${this.basePath}/material_did/`, payload);
  }

  update(id: number, payload: MaterialDidacticoPeticion): Observable<MaterialDidacticoDTO> {
    return this.api.put<MaterialDidacticoDTO>(`${this.basePath}/${id}/material_did/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/material_did/`);
  }

  deleteImage(id: number): Observable<any> {
    return this.api.delete<any>(`${this.basePath}/${id}/imagen/`);
  }

  deleteFile(id: number): Observable<any> {
    return this.api.delete<any>(`${this.basePath}/${id}/archivo/`);
  }

  listImages(): Observable<string[]> {
    return this.api.get<string[]>(`${this.basePath}/imagenes/`);
  }
}