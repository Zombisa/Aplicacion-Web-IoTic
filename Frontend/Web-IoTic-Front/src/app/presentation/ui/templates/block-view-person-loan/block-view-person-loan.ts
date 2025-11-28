import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LoanDTOConsultById } from '../../../../models/DTO/LoanDTOConsultById';

@Component({
  selector: 'app-block-view-person-loan',
  imports: [CommonModule],
  templateUrl: './block-view-person-loan.html',
  styleUrl: './block-view-person-loan.css'
})
export class BlockViewPersonLoan implements OnChanges {
  
  @Input() loanData?: LoanDTOConsultById;
  @Output() onReturnLoan: boolean = false;
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }
  
}
