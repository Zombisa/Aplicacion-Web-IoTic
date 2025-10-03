import { Routes } from '@angular/router';
import { LoginPage } from './presentation/ui/pages/login-page/login-page';
import { Home } from './presentation/ui/pages/home/home';

export const routes: Routes = [
     { path: 'login', component: LoginPage },
     {path: 'home', component: Home}
];
