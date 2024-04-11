import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UpdUsersPageRoutingModule } from './upd-users-routing.module';
import { UpdUsersPage } from './upd-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    UpdUsersPageRoutingModule
  ],
  declarations: [UpdUsersPage]
})
export class UpdUsersPageModule {}
