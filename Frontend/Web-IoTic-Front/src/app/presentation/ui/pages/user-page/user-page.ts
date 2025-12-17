import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-user-page',
  imports: [Header, CommonModule, MatIconModule],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css'
})
export class UserPage implements OnInit {
  user$!: Observable<User | null>;
  isAdmin$!: Observable<boolean>;
  isAdminOrMentor$!: Observable<boolean>;
  constructor(public router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    this.user$ = this.authService.currentUser;
    this.isAdmin$ = this.authService.isAdmin().pipe(
      startWith(false),
      map(isAdmin => {
        
        return isAdmin;
      })
    );
    this.isAdminOrMentor$ = this.authService.isAdminOrMentor().pipe(
      startWith(false),
      map(isAdminOrMentor => {
        return isAdminOrMentor;
      })
    );
    this.user$.subscribe(user => {
      // console.log('Usuario actual:', user); --- IGNORE ---
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
    
  

}
