import { Routes } from '@angular/router';
import { LoginPage } from './presentation/ui/pages/login-page/login-page';
import { HomePage } from './presentation/ui/pages/home-page/home-page';
import { user } from '@angular/fire/auth';
import { UserPage } from './presentation/ui/pages/user-page/user-page';

export const routes: Routes = [

     { path: '', redirectTo: 'home', pathMatch: 'full' },
     { path: 'login', component: LoginPage },
     { path: 'home', component: HomePage },
     { path: 'user', component: UserPage},
];
