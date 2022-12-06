import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { SMS } from '@ionic-native/sms/ngx';
//Modal
import { VisitorsPage } from '../modals/visitors/visitors.page';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ExploreContainerComponentModule,
    Tab1PageRoutingModule
  ],
  providers: [SMS],
  declarations: [Tab1Page,VisitorsPage],
  entryComponents:[VisitorsPage]

})
export class Tab1PageModule {}
