import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { LoadingService } from '../../../../services/loading.service';
import { JuradoService } from '../../../../services/information/jurado.service';
import { JuradoDTO } from '../../../../models/DTO/informacion/JuradoDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-jurado',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-jurado.html',
  styleUrl: './view-jurado.css'
})
export class ViewJurado implements OnInit {
  private juradoId!: number;
  public jurado!: JuradoDTO;
  public juradoImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private juradoService: JuradoService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.juradoId = Number(params.get('id'));
      this.getJuradoById();
    });
  }

  getJuradoById(): void {
    this.loadingService.show();
    this.juradoService.getById(this.juradoId).subscribe({
      next: (jurado) => {
        this.jurado = jurado;
        const posibleImagen = jurado.image_r2;
        this.juradoImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el jurado:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del jurado.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}


