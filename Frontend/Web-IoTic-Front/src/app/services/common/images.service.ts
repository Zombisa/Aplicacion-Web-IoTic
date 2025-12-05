import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  constructor(private http: HttpClient, private config: AppConfigService) {}

 /**
   * Solicita al backend una URL prefirmada (presigned URL)
   * que permite subir un archivo directamente a Cloudflare R2.
   *
   * @param extension  Extensión del archivo (jpg, png, webp, etc).
   * @param contentType Tipo MIME del archivo (image/png, image/jpeg, etc).
   * @returns Observable con los datos devueltos por el backend, incluyendo:
   *          - upload_url : URL temporal a Cloudflare R2 para realizar el PUT.
   *          - file_path  : Ruta final del archivo dentro del bucket.
   */
  getPresignedUrl(extension: string, contentType: string): Observable<any> {
    return this.http.post(`${this.config.apiUrlBackend}urlfirmada/generar-url/`, {
      extension,
      content_type: contentType
    });
  }
 /**
   * Carga un archivo directamente a Cloudflare R2 utilizando la
   * URL prefirmada generada por el backend.
   *
   *
   * @param uploadUrl URL prefirmada obtenida desde el backend.
   * @param file      Archivo seleccionado por el usuario.
   * @returns Observable con la respuesta del PUT (normalmente vacío).
   */
   uploadToR2(uploadUrl: string, file: File): Observable<any> {

    const headers = new HttpHeaders({
      "Content-Type": file.type
    });

    return this.http.put(uploadUrl, file, { headers, responseType: 'text' });
  }
}
