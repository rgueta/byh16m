import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule,ReactiveFormsModule } from "@angular/forms";
import { ScreenOrientation} from "@ionic-native/screen-orientation/ngx";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from "../environments/environment";
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { SMS } from "@ionic-native/sms/ngx";
import { Sim } from "@ionic-native/sim/ngx";
import { UpdCodesModalPageRoutingModule } from "./modals/upd-codes-modal/upd-codes-modal-routing.module";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UpdCodesModalPageRoutingModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
     ScreenOrientation,SMS,Sim
    ],
  bootstrap: [AppComponent],
})
export class AppModule {}
