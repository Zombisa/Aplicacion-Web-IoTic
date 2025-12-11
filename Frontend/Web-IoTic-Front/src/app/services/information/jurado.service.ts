import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "../common/api.service";
import { JuradoDTO } from "../../models/DTO/informacion/JuradoDTO";
import { JuradoPeticion } from "../../models/Peticion/informacion/JuradoPeticion";

@Injectable({
  providedIn: 'root'
})
export class JuradoService {

  private readonly basePath = 'informacion/jurados';

  constructor(private api: ApiService) {}

  getAll(): Observable<JuradoDTO[]> {
    return this.api.get<JuradoDTO[]>(`${this.basePath}/`);
  }

  getById(id: number): Observable<JuradoDTO> {
    return this.api.get<JuradoDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: JuradoPeticion): Observable<JuradoDTO> {
    return this.api.post<JuradoDTO>(`${this.basePath}/jurado/`, payload);
  }

  update(id: number, payload: JuradoPeticion): Observable<JuradoDTO> {
    return this.api.put<JuradoDTO>(`${this.basePath}/${id}/jurado/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/jurado/`);
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