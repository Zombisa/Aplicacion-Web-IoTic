import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoProductivity } from '../../templates/section-info-productivity/section-info-productivity';
import { LoadingService } from '../../../../services/loading.service';
import { CapBookService } from '../../../../services/information/cap-book.service';
import { CapBookDTO } from '../../../../models/DTO/CapBookDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-cap-book',
  imports: [CommonModule, Header, LoadingPage, SectionInfoProductivity],
  templateUrl: './view-cap-book.html',
  styleUrl: './view-cap-book.css'
})
export class ViewCapBook implements OnInit {
  private capBookId!: number;
  public capBook!: CapBookDTO;
  public capBookImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private capBookService: CapBookService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.capBookId = Number(params.get('id'));
      console.log('ID del capítulo obtenido de la URL:', this.capBookId);
      this.getCapBookById();
    });
  }

  getCapBookById(): void {
    this.loadingService.show();
    console.log('Obteniendo el capítulo con ID:', this.capBookId);
    this.capBookService.getById(this.capBookId).subscribe({
      next: (capBook) => {
        this.capBook = capBook;
        console.log('Capítulo obtenido:', this.capBook);
        const posibleImagen = this.capBook.image_r2;
        this.capBookImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el capítulo:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del capítulo.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}

