import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SoftwareDTO } from "../../models/DTO/informacion/SoftwareDTO";
import { SoftwarePeticion } from "../../models/Peticion/informacion/SoftwarePeticion ";
import { ApiService } from "../common/api.service";

@Injectable({
  providedIn: 'root'
})
export class SoftwareService {

  private readonly basePath = 'informacion/software';

  constructor(private api: ApiService) {}

  getAll(): Observable<SoftwareDTO[]> {
    // listar_software usa url_path='software'
    return this.api.get<SoftwareDTO[]>(`${this.basePath}/software/`);
  }

  getById(id: number): Observable<SoftwareDTO> {
    return this.api.get<SoftwareDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: SoftwarePeticion): Observable<SoftwareDTO> {
    return this.api.post<SoftwareDTO>(`${this.basePath}/software/`, payload);
  }

  update(id: number, payload: SoftwarePeticion): Observable<SoftwareDTO> {
    return this.api.put<SoftwareDTO>(`${this.basePath}/${id}/software/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/software/`);
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