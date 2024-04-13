import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BackstagePage } from './backstage.page';

const routes: Routes = [
  {
    path: '',
    component: BackstagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackstagePageRoutingModule {}
