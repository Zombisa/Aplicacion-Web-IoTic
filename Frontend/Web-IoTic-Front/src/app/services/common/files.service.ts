import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private http: HttpClient, private config: AppConfigService) {}

  /**
   * Solicita una URL firmada al backend para subir archivos a R2
   * @param extension Extensión del archivo (jpg, png, pdf, doc, etc)
   * @param contentType Tipo MIME del archivo (image/jpeg, application/pdf, etc)
   * @returns Observable con la respuesta del backend que incluye la URL firmada
   *  y la ruta del archivo en R2
   */
  getPresignedUrl(extension: string, contentType: string): Observable<any> {
    return this.http.post(`${this.config.apiUrlBackend}informacion/urlfirmada/files/`, {
      extension,
      content_type: contentType
    });
  }

  /**
   * Sube un archivo a R2 usando la URL firmada proporcionada
   * @param uploadUrl URL firmada para subir el archivo
   * @param file Archivo a subir
   * @returns Observable con la respuesta de la subida
   */
  uploadToR2(uploadUrl: string, file: File): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": file.type
    });

    return this.http.put(uploadUrl, file, { headers, responseType: 'text' });
  }
}
