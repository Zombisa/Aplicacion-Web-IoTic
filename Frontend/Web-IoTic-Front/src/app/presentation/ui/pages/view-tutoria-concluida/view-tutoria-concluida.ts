import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoProductivity } from '../../templates/section-info-productivity/section-info-productivity';
import { LoadingService } from '../../../../services/loading.service';
import { TutoriaConcluidaService } from '../../../../services/information/tutoria-concluida.service';
import { TutoriaConcluidaDTO } from '../../../../models/DTO/informacion/TutoriaConcluidaDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-tutoria-concluida',
  imports: [CommonModule, Header, LoadingPage, SectionInfoProductivity],
  templateUrl: './view-tutoria-concluida.html',
  styleUrl: './view-tutoria-concluida.css'
})
export class ViewTutoriaConcluida implements OnInit {
  private tutoriaId!: number;
  public tutoria!: TutoriaConcluidaDTO;
  public tutoriaImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private tutoriaService: TutoriaConcluidaService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.tutoriaId = Number(params.get('id'));
      console.log('ID de la tutoría obtenido de la URL:', this.tutoriaId);
      this.getTutoriaById();
    });
  }

  getTutoriaById(): void {
    this.loadingService.show();
    console.log('Obteniendo la tutoría con ID:', this.tutoriaId);
    this.tutoriaService.getById(this.tutoriaId).subscribe({
      next: (tutoria) => {
        this.tutoria = tutoria;
        console.log('Tutoría obtenida:', this.tutoria);
        const posibleImagen = this.tutoria.image_r2;
        this.tutoriaImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener la tutoría:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información de la tutoría.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}

