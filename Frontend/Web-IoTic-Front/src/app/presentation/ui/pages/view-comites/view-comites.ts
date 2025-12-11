import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { LoadingService } from '../../../../services/loading.service';
import { ParticipacionComitesEvService } from '../../../../services/information/participacion-comites-ev.service';
import { ParticipacionComitesEvDTO } from '../../../../models/DTO/informacion/ParticipacionComitesEvDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-comites',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-comites.html',
  styleUrl: './view-comites.css'
})
export class ViewComites implements OnInit {
  private comiteId!: number;
  public comite!: ParticipacionComitesEvDTO;
  public comiteImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private comitesService: ParticipacionComitesEvService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.comiteId = Number(params.get('id'));
      this.getComiteById();
    });
  }

  getComiteById(): void {
    this.loadingService.show();
    this.comitesService.getById(this.comiteId).subscribe({
      next: (comite) => {
        this.comite = comite;
        const posibleImagen = comite.image_r2;
        this.comiteImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el comité de evaluación:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del comité.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}


