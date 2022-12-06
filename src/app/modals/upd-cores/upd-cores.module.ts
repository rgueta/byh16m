import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdCoresPageRoutingModule } from './upd-cores-routing.module';

import { UpdCoresPage } from './upd-cores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdCoresPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [UpdCoresPage]
})
export class UpdCoresPageModule {}
