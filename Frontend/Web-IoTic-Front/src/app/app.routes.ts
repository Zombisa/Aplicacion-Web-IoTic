
import { Routes } from '@angular/router';
import { LoginPage } from './presentation/ui/pages/login-page/login-page';
import { HomePage } from './presentation/ui/pages/home-page/home-page';
import { UserPage } from './presentation/ui/pages/user-page/user-page';
import { AuthGuard } from './guards/auth-guard';
import { InventoryPageComponent } from './presentation/ui/pages/inventory-page/inventory-page.component';
import { WhoWeAre } from './presentation/ui/pages/who-we-are/who-we-are';
import { AddItem } from './presentation/ui/pages/add-item/add-item';
import { AddLoan } from './presentation/ui/pages/add-loan/add-loan';
import { ProductivityPage } from './presentation/ui/pages/productivity-page/productivity-page';

export const routes: Routes = [

     { path: '', redirectTo: 'home', pathMatch: 'full' },
     { path: 'login', component: LoginPage },
     { path: 'home', component: HomePage },
     { path: 'user', component: UserPage, canActivate: [AuthGuard] },
     { path: 'inventario', component: InventoryPageComponent},
     {path: 'who-we-are', component: WhoWeAre},
     {path:'inventario/add-item', component: AddItem},
     {path: 'inventario/add-loan', component: AddLoan},
     {path: 'inventario/view-item/:id', component: ViewLoanItem},
     {path: 'productivity', component: ProductivityPage}
];
