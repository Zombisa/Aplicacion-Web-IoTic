import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(private http: HttpClient, private config: AppConfigService) {}

  /**
   * Comprime una imagen usando canvas
   * @param file archivo de imagen original
   * @param quality calidad de compresión (0.1 - 1.0)
   * @param maxWidth ancho máximo permitido
   * @returns archivo de imagen comprimido
   */
  compressImage(file: File, quality: number = 0.7, maxWidth = 1500): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = evt => {
        const img = new Image();
        img.src = evt.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject("Context failed");

          // Redimensionar si es necesario
          const scaleFactor = maxWidth && img.width > maxWidth
            ? maxWidth / img.width
            : 1;

          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            blob => {
              if (!blob) return reject("Error al comprimir");

              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            file.type,
            quality // 0.1 - 1.0
          );
        };
      };
    });
  }

  /**
   * Solicita una URL firmada al backend para subir a R2
   * @param extension extensión del archivo (jpg, png, etc)
   * @param contentType tipo MIME del archivo (image/jpeg, image/png, etc)
   * @returns Observable con la respuesta del backend que incluye la URL firmada
   *  y la ruta del archivo en R2
   */
  getPresignedUrl(extension: string, contentType: string): Observable<any> {
    return this.http.post(`${this.config.apiUrlBackend}informacion/urlfirmada/images/`, {
      extension,
      content_type: contentType
    });
  }

  /**
   * Sube un archivo a R2 usando la URL firmada proporcionada
   * @param uploadUrl URL firmada para subir el archivo
   * @param file archivo a subir
   * @returns Observable con la respuesta de la subida
   */
  uploadToR2(uploadUrl: string, file: File): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": file.type
    });

    return this.http.put(uploadUrl, file, { headers, responseType: 'text' });
  }

  /**
   * Comprime y sube una imagen a R2
   * @param file archivo de imagen original
   * @returns Observable que emite la ruta del archivo en R2
   * después de la subida exitosa
   */
  uploadCompressedImage(file: File): Observable<any> {
    const extension = file.name.split('.').pop() || "jpg";
    const mime = file.type;

    return from(this.compressImage(file, 0.7, 1500)).pipe(
      switchMap(compressedFile => {
        return this.getPresignedUrl(extension, mime).pipe(
          switchMap((res: any) =>
            this.uploadToR2(res.upload_url, compressedFile).pipe(
              switchMap(() => from([res.file_path])) // devuelve la ruta final
            )
          )
        );
      })
    );
  }
}
