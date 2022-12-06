import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdUsersPageRoutingModule } from './upd-users-routing.module';

import { UpdUsersPage } from './upd-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdUsersPageRoutingModule
  ],
  declarations: [UpdUsersPage]
})
export class UpdUsersPageModule {}
