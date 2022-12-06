import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DatabaseService } from './services/database.service';
 
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public codes:any;

  constructor(
    private platform: Platform,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private databaseService: DatabaseService,
    private loadingCtrl: LoadingController
  ) {
    this.initializeApp();
  }
 
  async initializeApp() {
    
    // await this.storage.create();
    this.platform.ready().then(async () => {
      const loading = await this.loadingCtrl.create();
    });
  }
} 
