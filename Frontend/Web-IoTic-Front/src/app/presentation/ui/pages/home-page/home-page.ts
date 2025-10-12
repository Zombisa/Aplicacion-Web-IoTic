import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Header } from '../../templates/header/header';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, Header],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  
}
