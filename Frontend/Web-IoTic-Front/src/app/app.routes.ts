import { Routes } from '@angular/router';
import { LoginPage } from './presentation/ui/pages/login-page/login-page';

export const routes: Routes = [

     { path: '', redirectTo: 'login', pathMatch: 'full' },
     { path: 'login', component: LoginPage },
];
