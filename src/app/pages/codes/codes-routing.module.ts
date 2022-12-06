import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodesPage } from './codes.page';

const routes: Routes = [
  {
    path: '',
    component: CodesPage,
  },
  {
    path: 'login',
    loadChildren: () => import('../login/login.module').then( m => m.LoginPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodesPageRoutingModule {}
