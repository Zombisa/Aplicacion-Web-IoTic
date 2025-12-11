import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  currentYear = new Date().getFullYear();
  
  developers = [
    'Esteban Santiago Escandón',
    'Isabela Sanchez Saavedra',
    'Jhoan David Chacón Morán',
    'Maria Paula Muñoz',
    'Mary Montenegro'
  ];
}

