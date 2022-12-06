import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { environment } from "../environments/environment";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodesPageModule } from "./pages/codes/codes.module";
import { AdminPageModule } from "./pages/admin/admin.module";
import { CallNumber } from "@ionic-native/call-number/ngx";
import { SMS } from "@ionic-native/sms/ngx";
import { Sim } from "@ionic-native/sim/ngx";
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
// import { IonicStorageModule  } from "@ionic/storage-angular";

// ------- Sockets -------------------------
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: environment.db.server_url, options: {} };

import { UpdCodesModalPageModule } from "./modals/upd-codes-modal/upd-codes-modal.module";
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Camera } from '@ionic-native/camera/ngx';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, 
            IonicModule.forRoot(),
            AppRoutingModule,
            HttpClientModule,
            FormsModule,
            ReactiveFormsModule,
            CodesPageModule,AdminPageModule,UpdCodesModalPageModule,
            SocketIoModule.forRoot(config)
            // IonicStorageModule.forRoot(),
          ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  CallNumber,SMS,Sim,ScreenOrientation,FileTransfer,File,Camera
],
// exports:[
//   FormsModule, ReactiveFormsModule
// ],
  bootstrap: [AppComponent]
})
export class AppModule {}
