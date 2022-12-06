import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AutoLoginGuard } from './guards/auto-login.guard';
import { IntroGuard } from './guards/intro.guard';


const routes: Routes = [
  {
    path:'',
    redirectTo:'/login',
    pathMatch:'full'
  },
  {
    path: '',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  // {
  //   path: 'register',
  //   loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule),
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'intro',
    loadChildren: () => import('./pages/intro/intro.module').then( m => m.IntroPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'upd-codes-modal',
    loadChildren: () => import('./modals/upd-codes-modal/upd-codes-modal.module').then( m => m.UpdCodesModalPageModule)
  },
  {
    path: 'visitors',
    loadChildren: () => import('./modals/visitors/visitors.module').then( m => m.VisitorsPageModule),
    canActivate: [IntroGuard]
  },
  {
    path: 'codes',
    loadChildren: () => import('./pages/codes/codes.module').then( m => m.CodesPageModule),
    canActivate:[AuthGuard, AutoLoginGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'contacts',
    loadChildren: () => import('./modals/contacts/contacts.module').then( m => m.ContactsPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then( m => m.AdminPageModule),
    canActivate:[AuthGuard, AutoLoginGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./modals/users/users.module').then( m => m.UsersPageModule)
  },
  {
    path: 'upd-users',
    loadChildren: () => import('./modals/upd-users/upd-users.module').then( m => m.UpdUsersPageModule)
  },
  {
    path: 'upd-cores',
    loadChildren: () => import('./modals/upd-cores/upd-cores.module').then( m => m.UpdCoresPageModule)
  },
  {
    path: 'store',
    loadChildren: () => import('./pages/store/store.module').then( m => m.StorePageModule)
  },
  {
    path: 'pwd-reset',
    loadChildren: () => import('./pages/pwd-reset/pwd-reset.module').then( m => m.PwdResetPageModule)
  },
  {
    path: 'info',
    loadChildren: () => import('./modals/info/info.module').then( m => m.InfoPageModule)
  }

  
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
