import { Observable } from "rxjs";
import { CursoDTO } from "../../models/DTO/informacion/CursoDTO";
import { ApiService } from "../common/api.service";
import { Injectable } from "@angular/core";
import { CursoPeticion } from "../../models/Peticion/informacion/CursoPeticion";

@Injectable({
  providedIn: 'root'
})
export class CursoService {

  private readonly basePath = 'informacion/cursos';

  constructor(private api: ApiService) {}

  getAll(): Observable<CursoDTO[]> {
    return this.api.get<CursoDTO[]>(`${this.basePath}/`);
  }

  getById(id: number): Observable<CursoDTO> {
    return this.api.get<CursoDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: CursoPeticion): Observable<CursoDTO> {
    return this.api.post<CursoDTO>(`${this.basePath}/curso/`, payload);
  }

  update(id: number, payload: CursoPeticion): Observable<CursoDTO> {
    return this.api.put<CursoDTO>(`${this.basePath}/${id}/curso/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/curso/`);
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