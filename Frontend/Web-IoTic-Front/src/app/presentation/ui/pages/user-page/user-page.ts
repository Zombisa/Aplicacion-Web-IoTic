import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-page',
  imports: [Header, CommonModule],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css'
})
export class UserPage implements OnInit {
  user$!: Observable<User | null>;
  constructor(public router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    this.user$ = this.authService.currentUser;
    this.user$.subscribe(user => {
      if (user) {
        console.log('Usuario autenticado:', user);
      } else {
        console.log('No hay usuario autenticado');
      }
    });
  }


  navigateTo(path: string) {
    this.router.navigate([path]);
  }
    
  

}
