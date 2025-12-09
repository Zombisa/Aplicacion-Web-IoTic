import { Observable } from "rxjs";
import { RevistaDTO } from "../../models/DTO/informacion/RevistaDTO";
import { Injectable } from "@angular/core";
import { ApiService } from "../common/api.service";
import { RevistaPeticion } from "../../models/Peticion/informacion/RevistaPeticion";

@Injectable({
  providedIn: 'root'
})
export class RevistaService {

  private readonly basePath = 'revista';

  constructor(private api: ApiService) {}

  getAll(): Observable<RevistaDTO[]> {
    return this.api.get<RevistaDTO[]>(`${this.basePath}/revistas/`);
  }

  getById(id: number): Observable<RevistaDTO> {
    return this.api.get<RevistaDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: RevistaPeticion): Observable<RevistaDTO> {
    return this.api.post<RevistaDTO>(`${this.basePath}/revista/`, payload);
  }

  update(id: number, payload: RevistaPeticion): Observable<RevistaDTO> {
    return this.api.put<RevistaDTO>(`${this.basePath}/${id}/revista/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/revista/`);
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