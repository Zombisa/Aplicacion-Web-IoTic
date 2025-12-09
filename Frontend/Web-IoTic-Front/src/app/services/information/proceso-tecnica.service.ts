import { Observable } from "rxjs";
import { ApiService } from "../common/api.service";
import { Injectable } from "@angular/core";
import { ProcesoTecnicaDTO } from "../../models/DTO/informacion/ProcesoTecnicaDTO";
import { ProcesoTecnicaPeticion } from "../../models/Peticion/informacion/ProcesoTecnicaPeticion";

@Injectable({
  providedIn: 'root'
})
export class ProcesoTecnicaService {

  private readonly basePath = 'procesoTecnica';

  constructor(private api: ApiService) {}

  getAll(): Observable<ProcesoTecnicaDTO[]> {
    return this.api.get<ProcesoTecnicaDTO[]>(`${this.basePath}/procesos_tecnicas/`);
  }

  getById(id: number): Observable<ProcesoTecnicaDTO> {
    return this.api.get<ProcesoTecnicaDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: ProcesoTecnicaPeticion): Observable<ProcesoTecnicaDTO> {
    return this.api.post<ProcesoTecnicaDTO>(`${this.basePath}/proceso_tecnica/`, payload);
  }

  update(id: number, payload: ProcesoTecnicaPeticion): Observable<ProcesoTecnicaDTO> {
    return this.api.put<ProcesoTecnicaDTO>(`${this.basePath}/${id}/proceso_tecnica/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/proceso_tecnica/`);
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
