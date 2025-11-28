import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EvaluationCommitteeForm } from '../evaluation-committee-form';
import { EvaluationCommitteesService } from '../../../../../../../services/publications/evaluation-committees.service';
import { Router } from '@angular/router';
import { EvaluationCommitteePeticion } from '../../../../../../../models/Peticion/evaluation-committeePeticion';

@Component({
  selector: 'app-evaluation-committee-create-page',
  standalone: true,
  imports: [CommonModule, EvaluationCommitteeForm],
  templateUrl: './evaluation-committee-create-page.html',
  styleUrl: './evaluation-committee-create-page.css'
})
export class EvaluationCommitteeCreatePage {
  isLoading = false;

  constructor(
    private service: EvaluationCommitteesService,
    private router: Router
  ) { }

  onSave(data: EvaluationCommitteePeticion) { 
    this.isLoading = true;
    
    this.service.create(data).subscribe({
      next: (savedCommittee) => {
        this.isLoading = false;
        this.router.navigate(['/publicaciones/comites']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creando comité:', error);
        alert('Error al crear la participación');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/publicaciones/comites']);
  }
}

