
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
import { ViewItem } from './presentation/ui/pages/view-item/view-item';
import { ItemAvailableGuard } from './guards/item-available-guard';
import { EditItem } from './presentation/ui/pages/edit-item/edit-item';
import { ViewHistoryLoan } from './presentation/ui/pages/view-history-loan/view-history-loan';
import { ViewLoanItem } from './presentation/ui/pages/view-loan-item/view-loan-item';
import { PublisItemProductiviy } from './presentation/ui/pages/publis-item-productiviy/publis-item-productiviy';
import { PanelPublishProductivity } from './presentation/ui/pages/panel-publish-productivity/panel-publish-productivity';
import { EditWhoWeAre } from './presentation/ui/pages/edit-who-we-are/edit-who-we-are';
import { AdminGuard } from './guards/admin-guard-guard';

export const routes: Routes = [

     { path: '', redirectTo: 'home', pathMatch: 'full' },
     { path: 'login', component: LoginPage },
     { path: 'home', component: HomePage },
     { path: 'user', component: UserPage, canActivate: [AuthGuard] },
     { path: 'inventario', component: InventoryPageComponent},
     {path: 'who-we-are', component: WhoWeAre},
     {path: 'who-we-are/edit', component: EditWhoWeAre, canActivate: [AdminGuard]},
     {path:'inventario/add-item', component: AddItem},
     {path: 'inventario/add-loan/:id', component: AddLoan, canActivate: [ItemAvailableGuard]},
     {path: 'inventario/view-item/:id', component: ViewItem},
     {path: 'inventario/edit-item/:id', component: EditItem},
     {path: 'prestamos/pretamo/:id', component: ViewLoanItem},
     {path: 'inventario/history', component: ViewHistoryLoan},
     {path: 'productividad', component: ProductivityPage},
     {path: 'productividad/panel', component: PanelPublishProductivity},
     {path: 'productividad/panel/formulario/:tipo', component: PublisItemProductiviy},
];