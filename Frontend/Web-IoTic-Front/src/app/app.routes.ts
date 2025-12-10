
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
import { UsersManagementPageComponent } from './presentation/ui/pages/users-management-page/users-management-page';
import { AddUser } from './presentation/ui/pages/add-user/add-user';
import { ViewUser } from './presentation/ui/pages/view-user/view-user';
import { ProductivityListTypePage } from './presentation/ui/pages/productivity-list-type-page/productivity-list-type-page';
import { ViewBook } from './presentation/ui/pages/view-book/view-book';
import { ViewCurso } from './presentation/ui/pages/view-curso/view-curso';
import { ViewEvento } from './presentation/ui/pages/view-evento/view-evento';
import { ViewCapBook } from './presentation/ui/pages/view-cap-book/view-cap-book';
import { ViewRevista } from './presentation/ui/pages/view-revista/view-revista';
import { ViewSoftware } from './presentation/ui/pages/view-software/view-software';
import { ViewTutoriaConcluida } from './presentation/ui/pages/view-tutoria-concluida/view-tutoria-concluida';
import { ViewTutoriaEnMarcha } from './presentation/ui/pages/view-tutoria-en-marcha/view-tutoria-en-marcha';
import { ViewTrabajoEventos } from './presentation/ui/pages/view-trabajo-eventos/view-trabajo-eventos';
import { EditProductiviy } from './presentation/ui/pages/edit-item-productiviy/edit-item-productiviy';
import { ViewProcesoTecnica } from './presentation/ui/pages/view-proceso-tecnica/view-proceso-tecnica';
import { ViewComites } from './presentation/ui/pages/view-comites/view-comites';
import { ViewJurado } from './presentation/ui/pages/view-jurado/view-jurado';

export const routes: Routes = [

     { path: '', redirectTo: 'home', pathMatch: 'full' },
     { path: 'login', component: LoginPage },
     { path: 'home', component: HomePage },
     { path: 'user', component: UserPage, canActivate: [AuthGuard] },
     { path: 'usuarios', component: UsersManagementPageComponent, canActivate: [AuthGuard, AdminGuard] },
     { path: 'usuarios/add', component: AddUser, canActivate: [AuthGuard, AdminGuard] },
     { path: 'usuarios/view/:id', component: ViewUser, canActivate: [AuthGuard] },
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
     {path: 'productividad/lista/:tipo', component: ProductivityListTypePage},
     {path: 'productividad/panel', component: PanelPublishProductivity},
     {path: 'productividad/panel/formulario/:tipo', component: PublisItemProductiviy},
     {path: 'productividad/libros/:id', component: ViewBook},
     {path: 'productividad/capitulos/:id', component: ViewCapBook},
     {path: 'productividad/cursos/:id', component: ViewCurso},
     {path: 'productividad/eventos/:id', component: ViewEvento},
     {path: 'productividad/revistas/:id', component: ViewRevista},
     {path: 'productividad/software/:id', component: ViewSoftware},
     {path: 'productividad/tutorias_concluidas/:id', component: ViewTutoriaConcluida},
     {path: 'productividad/tutorias_en_marcha/:id', component: ViewTutoriaEnMarcha},
     {path: 'productividad/trabajo-eventos/:id', component: ViewTrabajoEventos},
     {path: 'productividad/procesos/:id', component: ViewProcesoTecnica},
     {path: 'productividad/proceso-tecnica/:id', component: ViewProcesoTecnica},
     {path: 'productividad/comites/:id', component: ViewComites},
     {path: 'productividad/participacion-comites/:id', component: ViewComites},
     {path: 'productividad/jurado/:id', component: ViewJurado},
     {path: 'productividad/editar/:tipo/:id', component: EditProductiviy},
];