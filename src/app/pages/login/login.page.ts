
import { AuthenticationService } from './../../services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController,isPlatform } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { environment } from "../../../environments/environment";
import { Storage, Plugins } from "@capacitor/core";
import { ScreenOrientation } from "@ionic-native/screen-orientation/ngx";

// import { Plugins } from "@capacitor/core";
// const { Storage } = Plugins;

const { Device } = Plugins;

const REFRESH_TOKEN_KEY = 'my-refresh-token';
const TOKEN_KEY = 'my-token';
const USERID = 'my-userId';
const USER_ROLES = 'my-roles';
const CORE_SIM = 'my-core-sim';
const USER_ROLE = 'my-role';
const MY_SIM = 'my-sim';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isAndroid:any;
  credentials: FormGroup;
  creds = {
    email :'neighbor2@gmail.com',
    pwd : '1234'
  };
  device_info:any;
 

 private  REST_API_SERVER = environment.db.server_url;
 public version = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
    private databaseService : DatabaseService,
    private screenOrientation: ScreenOrientation
  ) {}
 
  async ngOnInit() {
    this.version = environment.app.version;
    if(isPlatform('cordova') || isPlatform('ios')){
      this.lockToPortrait();
    }else if(isPlatform('android')){
      this.isAndroid = true;
    }

    Storage.clear();
    this.credentials = this.fb.group({
      email: ['neighbor2@gmail.com', [Validators.required, Validators.email]],
      pwd: ['1234', [Validators.required, Validators.minLength(4)]],
    });

    this.device_info = await Device.getInfo()
  }

  lockToPortrait(){
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }


  async login() {
    const loading = await this.loadingController.create();
    await loading.present();
    
    this.authService.login(this.credentials.value).subscribe(
      async res => {        
        await loading.dismiss();   
        const roles = await Storage.get({key : USER_ROLES}); // typeof object
        let myrole = ''; //await Storage.get({key : USER_ROLE});

        Storage.get({key : USER_ROLE}).then(val_myrole => {
          console.log('Login.. page my-role --->  ' + val_myrole.value);
          if(val_myrole.value === 'admin' || val_myrole.value === 'neighbor'){
            this.router.navigateByUrl('/tabs', { replaceUrl: true });
          }else{
           this.router.navigateByUrl('/store', { replaceUrl: true });
          }
        });
      },
      async err  =>{
        if (err.error.errId == 1){
          console.log('Abrir registro');
        }

        await loading.dismiss();
        
        const alert = await this.alertController.create({
          header: 'Fallo el acceso',
          message: err.error.ErrMsg,
          buttons: [
            {
              text : 'Registro nuevo',
              role : 'registro',
              handler : () => {
                const url = '/register'
                this.router.navigateByUrl(url, {replaceUrl: true});
                // this.router.navigate([url] , { state : { from : 'login'}  }); //send parameters
              }
            },
            { text : 'OK'}
          ],
        });

        await alert.present();
      }
    );
}

  // Easy access for form fields
  get email() {
    return this.credentials.get('email');
  }
  
  get password() {
    return this.credentials.get('pwd');
  }
}