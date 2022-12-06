import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VisitorsPageRoutingModule } from './visitors-routing.module';
import { VisitorsPage } from './visitors.page';
import { CallNumber } from "@ionic-native/call-number/ngx";
import { SMS } from "@ionic-native/sms/ngx";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    VisitorsPageRoutingModule,
    CallNumber,
    SMS
  ],
  declarations: [VisitorsPage]
})
export class VisitorsPageModule {}
