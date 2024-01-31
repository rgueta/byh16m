import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './../../services/authentication.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from "../../../environments/environment";
import { AlertController, LoadingController, isPlatform, 
  ModalController, Platform} from "@ionic/angular";
import { ScreenOrientation } from "@ionic-native/screen-orientation/ngx";
import { Device } from "@capacitor/device";
import { Utils } from 'src/app/tools/tools';
import { RequestsPage } from "../../modals/requests/requests.page";
// import localNotification from "../../tools/localNotification";
import { Sim } from "@ionic-native/sim/ngx"; 
import { DatabaseService } from "../../services/database.service"
import { Network, ConnectionStatus } from "@capacitor/network";

const USER_ROLES = 'my-roles';
const USER_ROLE = 'my-role';
const VISITORS = 'visitors';
const DEVICE_UUID = 'device-uuid';
const DEVICE_PKG = 'device-pkg';
const ADMIN_DEVICE = 'admin_device';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  networkStatus: ConnectionStatus;
  isAndroid:any;
  credentials: FormGroup;
  configApp : {};

  // Easy access for form fields
   get email() {
    return this.credentials.get('email');
  }
  
  get password() {
    return this.credentials.get('pwd');
  }
  
 device_info:any;

 private  REST_API_SERVER = environment.cloud.server_url;
 public version = '';
 net_status:any;
 device_uuid:string='';
 admin_device:any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private orientation:ScreenOrientation,
    private loadingController: LoadingController,
    private router: Router,
    private alertController: AlertController,
    private modalController:ModalController,
    private SIM : Sim,
    private platform: Platform,
    private api : DatabaseService

  ) {

   }
   

  async ngOnInit() {

    if(Network){
      console.log('Network detection.')
      Network.getStatus().then((status) => {
        this.networkStatus = status;
      });
    }

    // Check nerwork connection
    Network.addListener('networkStatusChange', netStatus => {
      const {connected, connectionType} = netStatus
      this.networkStatus =  netStatus;

      //'wifi' | 'cellular' | 'none' | 'unknown'
     const networkType = connectionType;
     
     console.log('Network status changed', this.networkStatus);
     console.log('networkType:', networkType);

    });

    const logCurrentNetworkStatus = async () => {
      // const status = await Network.getStatus();

      Network.getStatus().then((status) => {
            this.networkStatus=status;
          });
    
      console.log('Network detection.')
      console.log('Network status:',  this.networkStatus);
    };

    this.getConfigApp();

    Utils.cleanLocalStorage();
    this.init();
    this.version = environment.app.version;

    if(isPlatform('cordova')){
      console.log('Soy plataforma cordova')
    }else if(isPlatform('ios')){
      console.log('Soy plataforma ios')
    }else if(isPlatform('ipad')){
      console.log('Soy plataforma ios')
    }else if(isPlatform('iphone')){
      console.log('Soy plataforma ios')
    }else if(isPlatform('desktop')){
      console.log('Soy plataforma desktop')
      this.lockToPortrait();
    }else if(isPlatform('android')){
      console.log('Soy plataforma android')
      this.isAndroid = true;
    }

    this.credentials = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      pwd: new FormControl('', [Validators.required, Validators.minLength(4)]),
    });

    await Device.getInfo().then(async DeviceInfo => {
      this.device_info = await JSON.parse(JSON.stringify(DeviceInfo));

      // get device uuid
      await Device.getId().then(async (deviceId:any) =>{
        await localStorage.setItem(DEVICE_UUID, await (deviceId['identifier']));
        this.device_uuid = await (deviceId['identifier']);
       });

       this.device_info.uuid = await this.device_uuid;
       await localStorage.setItem(DEVICE_PKG, await JSON.stringify(this.device_info));
  
       if (this.device_info.platform === 'android') {
         try {
            delete this.device_info.memUsed
            delete this.device_info.diskFree
            delete this.device_info.diskTotal
            delete this.device_info.realDiskFree
            delete this.device_info.realDiskTotal
         } catch (e) {
           console.log('soy android con Error: ', e);
       }
     }else{
       console.log('no soy android');
     }
    });
      
      // if (this.admin_device.includes(this.device_uuid)){
      if (1 == 1){
        await this.credentials.get('email').setValue ('neighbor2@gmail.com');
        await this.credentials.get('pwd').setValue ('1234');
      }
  }

  async init(): Promise<void> {
    await this.SIM.hasReadPermission().then(async allowed =>{
      if(!allowed){
        console.log('Si entre init sim has read permissions')
        await this.SIM.requestReadPermission().then( 
        async () => {
            await this.SIM.getSimInfo().then(
            (info) => console.log('Sim info: ', info),
            (err) => console.log('Unable to get sim info: ', err)
          );
           },
        () => console.log('Permission denied')
        )
      }
    });   
 }

 // get Config App ----
 async getConfigApp(){
     await this.api.getData("api/config/").subscribe(async (result:any) =>{
      this.admin_device = result[0].admin_device;
      await localStorage.setItem(ADMIN_DEVICE,await result[0].admin_device);
    });
 }

  lockToPortrait(){
    this.orientation.lock(this.orientation.ORIENTATIONS.PORTRAIT)
  }

  async login() {

    if (!this.networkStatus.connected){
      this.showAlert('','','Favor de activa el acceso a la red',['Cerrar'])
      // console.log('Favor de activa el acceso a la red');
      return
    }

    const loading = await this.loadingController.create();
    await loading.present();
    this.authService.login(this.credentials.value).subscribe(
      async res => {        
        await loading.dismiss();
        const roles = await localStorage.getItem(USER_ROLES); // typeof object
        // let myrole = await localStorage.getItem(USER_ROLE);

       for(const val_myrole of JSON.parse(roles)){
          if(localStorage.getItem('locked') === 'true')
          {
            await this.lockedUser('Usuario bloqueado !');
            return;
          }
          if(val_myrole.name === 'admin' || val_myrole.name === 'neighbor'){

    // ------socket.io ---------------------------------

          //   await this.socket.on('connect', async ()=>{
          //     console.log('socket connected: ', this.socket.ioSocket.id);
          //     this.socket.emit('join',localStorage.getItem('core-id'));


          //     await this.socket.emit('join',localStorage.getItem('core-id'));


          //   });

          //   // this.socket.emit('join',localStorage.getItem('core-id'));
          //   // unir(localStorage.getItem('core-id'));

          //   // this.socket.on('*',()=>{
          //   //   console.log('on * !');
          //   //   this.socket.emit('join',localStorage.getItem('core-id'));
          //   // })
        
          //  await this.socket.on('joined', (msg:string)=>{
          //     console.log(msg);
          // });
          
          // await this.socket.on('Alert',async (msg:any)=>{
          //   console.log('Alert --> ', msg);
          //  await  localNotification(msg);
          // });

  // -----------------------------------------


          

            this.router.navigateByUrl('/tabs', { replaceUrl: true });
          }else{
           this.router.navigateByUrl('/store', { replaceUrl: true });
          }
        };

      },
      async err  =>{
        if (err.error.errId == 1){
          console.log('Abrir registro');
        }
        await loading.dismiss();

        let msgErr='';

        const alert = await this.alertController.create({
          header: msgErr,
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

async lockedUser(msg:string){
  const alert = await this.alertController.create({
    // header: msgErr,
    message: msg,
    buttons: [
      {
        text : 'OK',
        role : 'registro',
        handler : () => {
          const url = '/'
          this.router.navigateByUrl(url, {replaceUrl: true});
          // this.router.navigate([url] , { state : { from : 'login'}  }); //send parameters
        }
      }
    ],
  });

  await alert.present();
}

async pwdReset(){
  const modal = await this.modalController.create({
    component: RequestsPage,
    componentProps:{request:'pwdReset'}
  });
   await modal.present();

}

async openStore(){
  this.router.navigate(['/store']);
}

async showAlert(Header:string, subHeader:string, msg:string, btns:any) {
  const alert = await this.alertController.create({
    header: Header,
    subHeader: subHeader,
    message: msg,
    buttons: btns,
  });

  await alert.present();
}

}
