import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { ProductivityItemView } from '../../templates/productivity-item-view/productivity-item-view';
import { CourseService } from '../../../../services/information/course.service';
import { LoadingService } from '../../../../services/loading.service';
import { CourseDTO } from '../../../../models/DTO/CourseDTO';

@Component({
  selector: 'app-view-course-page',
  imports: [CommonModule, Header, LoadingPage, ProductivityItemView],
  templateUrl: './view-course-page.html',
  styleUrl: './view-course-page.css'
})
export class ViewCoursePage implements OnInit {
  private courseId!: number;
  public course?: CourseDTO;

  constructor(
    private courseService: CourseService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.courseId = Number(params.get('id'));
      console.log('ID del curso obtenido de la URL:', this.courseId);
      this.getCourseById();
    });
  }

  /**
   * Obtener el curso por ID
   * @Returns void no retorna el curso pero si lo guarda dentro de la variable del componente
   */
  getCourseById(): void {
    this.loadingService.show();
    console.log('Obteniendo el curso con ID:', this.courseId);
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        console.log('Curso obtenido:', this.course);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el curso:', error);
        this.loadingService.hide();
      }
    });
  }
}

