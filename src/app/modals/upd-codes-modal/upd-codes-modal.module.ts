import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UpdCodesModalPageRoutingModule } from './upd-codes-modal-routing.module';
import { UpdCodesModalPage } from './upd-codes-modal.page';
import { QrCodeModule } from "ng-qrcode";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdCodesModalPageRoutingModule,
    ReactiveFormsModule,
    QrCodeModule
  ],
  declarations: [UpdCodesModalPage]
})
export class UpdCodesModalPageModule {}
