import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../templates/header/header';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanService } from '../../../../services/Loan.service';
import { LoanDTO } from '../../../../models/DTO/LoanDTO';

@Component({
  selector: 'app-view-loan-item',
  imports: [CommonModule, Header],
  templateUrl: './view-loan-item.html',
  styleUrl: './view-loan-item.css'
})
export class ViewLoanItem {
 itemId!: number;
  loanData?: LoanDTO;
  isLoading = true;
  showError = false;
  errorMessage = '';

  constructor(

    private router: Router,
    private route: ActivatedRoute,
    private loanService: LoanService
  ) {}

  ngOnInit(): void {
    // Obtener el parámetro "id" de la URL
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.itemId = Number(idParam);

      } else {
        this.showError = true;
        this.errorMessage = 'ID de item no proporcionado en la URL.';
      }
    });
  }

  markAsReturned() {
    if (this.loanData && this.loanData.id) {
      const returnData = {
        fechaDevolucion: new Date().toISOString().split('T')[0],
        observaciones: 'Devuelto a través del sistema'
      };

      this.loanService.returnLoan(this.loanData.id).subscribe({
        next: (updatedLoan) => {
          this.loanData = updatedLoan;
        },
        error: (error) => {
          console.error('Error al marcar como devuelto:', error);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/loans']);
  }

  printLoan() {
    window.print();
  }
}
