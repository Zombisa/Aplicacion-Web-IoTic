import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoProductivity } from '../../templates/section-info-productivity/section-info-productivity';
import { LoadingService } from '../../../../services/loading.service';
import { BooksService } from '../../../../services/information/books.service';
import { BookDTO } from '../../../../models/DTO/BookDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-book',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-book.html',
  styleUrl: './view-book.css'
})
export class ViewBook implements OnInit {
  private bookId!: number;
  public book!: BookDTO;
  public bookImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private booksService: BooksService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.bookId = Number(params.get('id'));
      console.log('ID del libro obtenido de la URL:', this.bookId);
      this.getBookById();
    });
  }

  getBookById(): void {
    this.loadingService.show();
    console.log('Obteniendo el libro con ID:', this.bookId);
    this.booksService.getById(this.bookId).subscribe({
      next: (book) => {
        this.book = book;
        console.log('Libro obtenido:', this.book);
        const posibleImagen = this.book.image_r2;
        this.bookImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el libro:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del libro.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}

