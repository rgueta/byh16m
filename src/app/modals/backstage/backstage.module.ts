import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BackstagePageRoutingModule } from './backstage-routing.module';

import { BackstagePage } from './backstage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BackstagePageRoutingModule
  ],
  declarations: [BackstagePage]
})
export class BackstagePageModule {}
