import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdUsersPage } from './upd-users.page';

const routes: Routes = [
  {
    path: '',
    component: UpdUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdUsersPageRoutingModule {}
