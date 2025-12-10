import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoProductivity } from '../../templates/section-info-productivity/section-info-productivity';
import { LoadingService } from '../../../../services/loading.service';
import { RevistaService } from '../../../../services/information/revista.service';
import { RevistaDTO } from '../../../../models/DTO/informacion/RevistaDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-revista',
  imports: [CommonModule, Header, LoadingPage, SectionInfoProductivity],
  templateUrl: './view-revista.html',
  styleUrl: './view-revista.css'
})
export class ViewRevista implements OnInit {
  private revistaId!: number;
  public revista!: RevistaDTO;
  public revistaImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private revistaService: RevistaService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.revistaId = Number(params.get('id'));
      console.log('ID de la revista obtenido de la URL:', this.revistaId);
      this.getRevistaById();
    });
  }

  getRevistaById(): void {
    this.loadingService.show();
    console.log('Obteniendo la revista con ID:', this.revistaId);
    this.revistaService.getById(this.revistaId).subscribe({
      next: (revista) => {
        this.revista = revista;
        console.log('Revista obtenida:', this.revista);
        const posibleImagen = this.revista.image_r2;
        this.revistaImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener la revista:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información de la revista.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}

