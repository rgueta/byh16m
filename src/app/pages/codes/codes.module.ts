import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CodesPage } from './codes.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';
import { CodesPageRoutingModule } from './codes-routing.module';


//Modal
// import { UpdCodesModalPage } from '../../modals/upd-codes-modal/upd-codes-modal.page';
import { UpdCodesModalPageModule } from '../../modals/upd-codes-modal/upd-codes-modal.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExploreContainerComponentModule,
    RouterModule.forChild([{ path: '', component: CodesPage }]),
    CodesPageRoutingModule
  ],
  declarations: [CodesPage]
})
export class CodesPageModule {}
