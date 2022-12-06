import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdCoresPage } from './upd-cores.page';

const routes: Routes = [
  {
    path: '',
    component: UpdCoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdCoresPageRoutingModule {}
