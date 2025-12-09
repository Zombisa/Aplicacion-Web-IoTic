import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  
  constructor(private http: HttpClient, private config: AppConfigService) {}


    /**
     * Solicita una URL firmada al backend para subir a R2
     * @param extension extensión del archivo (jpg, png, etc)
     * @param contentType tipo MIME del archivo (image/jpeg, image/png, etc)
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
     * Sube ela archivo a R2 usando la URL firmada proporcionada
     * @param uploadUrl URL firmada para subir el archivo
     * @param file archivo a subir
     * @returns 
     */
    uploadToR2(uploadUrl: string, file: File): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": file.type
    });

    return this.http.put(uploadUrl, file, { headers, responseType: 'text' });
  }
}
