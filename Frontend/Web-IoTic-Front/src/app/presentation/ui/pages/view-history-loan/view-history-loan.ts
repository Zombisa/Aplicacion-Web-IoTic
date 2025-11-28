import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { LoadingService } from '../../../../services/loading.service';
import { LoanService } from '../../../../services/Loan.service';
import { LoanDTO } from '../../../../models/DTO/LoanDTO';

@Component({
  selector: 'app-view-history-loan',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-history-loan.html',
  styleUrl: './view-history-loan.css'
})
export class ViewHistoryLoan implements OnInit {

  public allLoans: LoanDTO[] = [];
  public currentLoans: LoanDTO[]= [];
  private count: number = 0;

  constructor(
    public loadingService: LoadingService,
    private loanService: LoanService,
  )
  {

  }
  ngOnInit(): void {
    this.getAllLoans();
    this.getCurrentLoans();
  }

  private getAllLoans(): void {
    console.log("llamando a todos los prestamos desde el componente");
    this.loadingService.show();
    this.loanService.getLoans().subscribe({
      next: (loans) => {
        console.log("Loans obtenidos:", loans);
        this.allLoans = loans;
      },
      error: (error) => {
        console.error('Error al obtener los préstamos:', error);
        this.loadingService.hide();
      }
    });
  }
  private getCurrentLoans(): void{
    console.log("llamando a los prestamos VIGENTES desde el componente");
    this.loanService.getLoansCurrent().subscribe({
      next: (loans) => {
        console.log("PREstamos encontrados con exito");
        this.currentLoans = loans;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener los préstamos actuales:', error);
        this.loadingService.hide();
      } 
    })
  }
}
