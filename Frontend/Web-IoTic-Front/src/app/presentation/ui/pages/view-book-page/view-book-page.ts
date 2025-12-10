import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { ProductivityItemView } from '../../templates/productivity-item-view/productivity-item-view';
import { BooksService } from '../../../../services/information/books.service';
import { LoadingService } from '../../../../services/loading.service';
import { BookDTO } from '../../../../models/DTO/BookDTO';

@Component({
  selector: 'app-view-book-page',
  imports: [CommonModule, Header, LoadingPage, ProductivityItemView],
  templateUrl: './view-book-page.html',
  styleUrl: './view-book-page.css'
})
export class ViewBookPage implements OnInit {
  private bookId!: number;
  public book?: BookDTO;

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

  /**
   * Obtener el libro por ID
   * @Returns void no retorna el libro pero si lo guarda dentro de la variable del componente
   */
  getBookById(): void {
    this.loadingService.show();
    console.log('Obteniendo el libro con ID:', this.bookId);
    this.booksService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.book = book;
        console.log('Libro obtenido:', this.book);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el libro:', error);
        this.loadingService.hide();
      }
    });
  }
}

