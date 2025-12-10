import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoProductivity } from '../../templates/section-info-productivity/section-info-productivity';
import { LoadingService } from '../../../../services/loading.service';
import { CursoService } from '../../../../services/information/curso.service';
import { CursoDTO } from '../../../../models/DTO/informacion/CursoDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-curso',
  imports: [CommonModule, Header, LoadingPage, SectionInfoProductivity],
  templateUrl: './view-curso.html',
  styleUrl: './view-curso.css'
})
export class ViewCurso implements OnInit {
  private cursoId!: number;
  public curso!: CursoDTO;
  public cursoImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private cursoService: CursoService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
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
}

