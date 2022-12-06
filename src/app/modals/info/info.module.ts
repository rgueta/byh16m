import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InfoPageRoutingModule } from './info-routing.module';
import { InfoPage } from './info.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [InfoPage]
})
export class InfoPageModule {}
