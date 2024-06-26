import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { IntroGuard } from './guards/intro.guard';
import { AutoLoginGuard } from './guards/auto-login.guard';

const routes: Routes = [
  {
    path:'',
    redirectTo:'login',
    pathMatch:'full'
  },
  {
    path: '',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'codes',
    loadChildren: () => import('./pages/codes/codes.module').then( m => m.CodesPageModule),
    canActivate:[AuthGuard, AutoLoginGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then( m => m.AdminPageModule),
    canActivate:[AuthGuard, AutoLoginGuard]
  },
  {
    path: 'intro',
    loadChildren: () => import('./pages/intro/intro.module').then( m => m.IntroPageModule)
  },
  {
    path: 'store',
    loadChildren: () => import('./pages/store/store.module').then( m => m.StorePageModule)
  },
  {
    path: 'contacts',
    loadChildren: () => import('./modals/contacts/contacts.module').then( m => m.ContactsPageModule)
  },
  {
    path: 'info',
    loadChildren: () => import('./modals/info/info.module').then( m => m.InfoPageModule)
  },
  {
    path: 'upd-codes-modal',
    loadChildren: () => import('./modals/upd-codes-modal/upd-codes-modal.module').then( m => m.UpdCodesModalPageModule)
  },
  {
    path: 'upd-cores',
    loadChildren: () => import('./modals/upd-cores/upd-cores.module').then( m => m.UpdCoresPageModule)
  },
  {
    path: 'upd-users',
    loadChildren: () => import('./modals/upd-users/upd-users.module').then( m => m.UpdUsersPageModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./modals/users/users.module').then( m => m.UsersPageModule)
  },
  {
    path: 'visitors',
    loadChildren: () => import('./modals/visitors/visitors.module').then( m => m.VisitorsPageModule),
    canActivate: [IntroGuard]
  },
  {
    path: 'upd-cpus',
    loadChildren: () => import('./modals/upd-cpus/upd-cpus.module').then( m => m.UpdCpusPageModule)
  },
  {
    path: 'visitor-list',
    loadChildren: () => import('./modals/visitor-list/visitor-list.module').then( m => m.VisitorListPageModule)
  },
  {
    path: 'family',
    loadChildren: () => import('./modals/family/family.module').then( m => m.FamilyPageModule)
  },
  {
    path: 'requests',
    loadChildren: () => import('./modals/requests/requests.module').then( m => m.RequestsPageModule)
  },
  {
    path: 'backstage',
    loadChildren: () => import('./modals/backstage/backstage.module').then( m => m.BackstagePageModule)
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
