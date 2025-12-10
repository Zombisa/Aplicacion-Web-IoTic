import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { LoadingService } from '../../../../services/loading.service';
import { CursoService } from '../../../../services/information/curso.service';
import { CursoDTO } from '../../../../models/DTO/informacion/CursoDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-curso',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-curso.html',
  styleUrl: './view-curso.css'
})
export class ViewCurso implements OnInit {
  private cursoId!: number;
  public curso!: CursoDTO;
  public cursoImageUrl: string = 'assets/img/item-placeholder.svg';
  public youtubeEmbedUrl: SafeResourceUrl | null = null;

  constructor(
    private cursoService: CursoService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.cursoId = Number(params.get('id'));
      console.log('ID del curso obtenido de la URL:', this.cursoId);
      this.getCursoById();
    });
  }

  getCursoById(): void {
    this.loadingService.show();
    console.log('Obteniendo el curso con ID:', this.cursoId);
    this.cursoService.getById(this.cursoId).subscribe({
      next: (curso) => {
        this.curso = curso;
        console.log('Curso obtenido:', this.curso);
        const posibleImagen = this.curso.image_r2;
        this.cursoImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        
        // Convertir YouTube URL a embed URL
        if (this.curso.link) {
          this.youtubeEmbedUrl = this.getYoutubeEmbedUrl(this.curso.link);
        }
        
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el curso:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del curso.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }

  /**
   * Convierte una URL de YouTube a una URL de embed segura
   */
  getYoutubeEmbedUrl(url: string): SafeResourceUrl {
    let videoId = '';
    
    // Intentar extraer el ID de video de diferentes formatos de YouTube
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

