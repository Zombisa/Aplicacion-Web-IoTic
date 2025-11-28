// evaluation-committees-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EvaluationCommitteesService } from '../../../../../../services/publications/evaluation-committees.service';
import { EvaluationCommitteeDTO } from '../../../../../../models/DTO/evaluation-committeeDTO';

@Component({
  selector: 'app-evaluation-committees-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './evaluation-committees-page.html',
  styleUrls: ['./evaluation-committees-page.css']
})
export class EvaluationCommitteesPage implements OnInit {

  committees: EvaluationCommitteeDTO[] = [];
  loading = false;
  errorMessage = '';
  isAdmin = true;  

  constructor(
    private committeesService: EvaluationCommitteesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.committeesService.getAll().subscribe({
      next: (data: EvaluationCommitteeDTO[]) => {
        this.committees = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las participaciones';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/publicaciones/comites/nuevo']);
  }

  deleteCommittee(id: number | undefined): void {
    if (!id) {
      console.error('ID no definido');
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta participación?')) {
      this.committeesService.delete(id).subscribe({
        next: () => {
          this.committees = this.committees.filter(c => c.id !== id);
        },
        error: (error) => {
          console.error('Error eliminando:', error);
          alert('Error al eliminar la participación');
        }
      });
    }
  }

  goToEdit(id: number | undefined): void {
    if (!id) {
      console.error('ID no definido para editar');
      return;
    }
    this.router.navigate(['/publicaciones/comites/editar', id]);
  }
}