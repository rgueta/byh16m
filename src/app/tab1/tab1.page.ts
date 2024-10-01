import { Component ,Input, OnInit} from '@angular/core';
import { ModalController ,AnimationController, isPlatform,
  PopoverController, AlertController, LoadingController} from '@ionic/angular';
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { environment } from "../../environments/environment";
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { VisitorListPage } from '../modals/visitor-list/visitor-list.page';
import { UsersPage } from "../modals/users/users.page";
import { ScreenOrientation } from "@ionic-native/screen-orientation/ngx";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Utils } from "../tools/tools";
import { FamilyPage } from "../modals/family/family.page";
import { RequestsPage } from "../modals/requests/requests.page";

import {
  ActionPerformed, PushNotificationSchema, PushNotifications, Token,
} from '@capacitor/push-notifications';
import { FCM } from "@capacitor-community/fcm";
import { ToolsService } from "../services/tools.service";
import { UpdUsersPage } from "../modals/upd-users/upd-users.page";
import { BackstagePage } from "../modals/backstage/backstage.page";
import { AuthenticationService } from "./../services/authentication.service";


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  public localInfo : any = [];
  public codes : [];
  @Input() msg:string;
  @Input() sim:string;
  myToast:any;
  myRoles:any;
  public MyRole : string = 'visitor';
  isAndroid:any;
  currentUser = '';
  public version = '';
  public coreName = '';
  public coreId = '';
  twilio_client : any;
  userId : string;
  id : number = 0;
  btnVisible : boolean = true;
  titleMenuButtons = 'Ocultar botones'
  
  infoPanel : any;
  myEmail = '';
  REST_API_SERVER = environment.cloud.server_url;
  iosOrAndroid: boolean;
  demoMode:boolean = false;
  remote:boolean = false;

  constructor(
    private sms: SMS,
    public modalController: ModalController,
    private api: DatabaseService,
    public animationController : AnimationController,
    private router: Router,
    private screenOrientation: ScreenOrientation,
    // private SIM : Sim,
    private popoverCtrl:PopoverController,
    public alertCtrl: AlertController,
    private toolService: ToolsService,
    private loadingController : LoadingController,
    private authService: AuthenticationService,
  ) { }
  
  async ionViewWillEnter(){
    this.MyRole = localStorage.getItem('my-role');
    this.myEmail = localStorage.getItem('my-email');
    this.remote = await localStorage.getItem('remote') === 'true';

    

    if (localStorage.getItem('demoMode')){
      this.demoMode = localStorage.getItem('demoMode') == 'true' ? true : false
    }

    console.log('Valor del remote: ', this.remote);
    if (!this.remote){
      document.getElementById("infoSection").style.setProperty('margin-top', '15px','important');
      
      console.log('Si entreeeee');
    }

  }

  async ngOnInit(){
    const sim = await localStorage.getItem('my-core-sim');
    this.userId = await localStorage.getItem('my-userId');
    this.coreName = await localStorage.getItem('core-name');
    this.coreId = await localStorage.getItem('core-id')

    // -----------------firebase Push notification
    PushNotifications.requestPermissions().then(resul => {
      if(resul.receive === 'granted'){
        PushNotifications.register();
      }else{
        this.toolService.toastAlert('Push notification not granted..!',0,['Ok'],'middle');
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    //  Subscribe to a specific topic
    FCM.subscribeTo({ topic: localStorage.getItem('core-id') })
    .then() 
    .catch((err) => console.log(err));


    // Enable the auto initialization of the library
    FCM.setAutoInit({ enabled: true }).then();


    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    // pushNotification Received event
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.toolService.toastAlert(notification.body,0,['Ok'],'middle');
      },
    );

    // pushNotification clicked Action Performed event
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // alert('Push action performed: ' + JSON.stringify(notification));
      },
    );
  
    // -----------------------------------------------------

// this.init();
    this.version = environment.app.version;
    if(isPlatform('cordova') || isPlatform('ios')){
      this.lockToPortrait();
    }else if(isPlatform('android')){
      this.isAndroid = true;
    }

    // getting info data
    if(environment.app.debugging){
      console.log('collect Info jumped, because debugging!');
      await this.toolService.toastAlert('collect Info jumped, because debugging!',0,['Ok'],'bottom');
    }else{
      this.collectInfo();
    }

    this.infoPanel = document.getElementById("infoSection");
    this.infoPanel.style.marginTop = "115px";

  }

 async doRefresh(event:any){
  this.collectInfo();

  setTimeout(() => {
    event.target.complete();
  }, 2000);
}

DemoMode(){
  this.demoMode = !this.demoMode;
  localStorage.setItem('demoMode', this.demoMode.toString())
}

toggleButtons(){
  this.btnVisible = !this.btnVisible;
  
  if(this.btnVisible){
    this.titleMenuButtons = 'Ocultar botones'
    this.infoPanel.style.marginTop = "115px";
  }else{
    this.titleMenuButtons = 'Mostrar botones'
    this.infoPanel.style.marginTop = "0px";
  }

}

async modalBackstage(){
  const modal = await this.modalController.create({
    component : BackstagePage,
    componentProps:{
      'SourcePage': 'tab1NewNeighbor',
      'coreName': localStorage.getItem('core-name')
     }
  });
  return await modal.present()
}

async collectInfo(){
  let timestamp = '';
  if(await this.toolService.verifyNetStatus()){

    // get last api call variable
    if(!localStorage.getItem('lastInfo_updated')){
        timestamp = Utils.convDate(new Date())    
    }else{
      timestamp = localStorage.getItem('lastInfo_updated');
      // timestamp = '2024-01-29T00:49:49.857Z'
    }


    if(this.localInfo.length == 0 && !localStorage.getItem('info')){
      let d = new Date();
      d.setDate(d.getDate() - 180);
      timestamp = Utils.convDate(d);
    }
  
    if(this.localInfo.length == 0 && localStorage.getItem('info')){
        this.localInfo = JSON.parse(localStorage.getItem('info'));
    }

    try{
      this.api.getData('api/info/' + this.userId + '/' + timestamp).subscribe({
          next: async result => {
            if(Object.keys(result).length > 0){
              
              // get last api call variable
              if(this.localInfo.length > 0){
                // this.localInfo = JSON.parse(localStorage.getItem('info'));

                Object.entries(result).forEach(async ([key,item]) =>{
                  this.localInfo.push(item)
                });
                
                console.log('localInfo pushed : ', await this.localInfo);

              }else{
                this.localInfo = result;
              }

              this.localInfo = await Utils.sortJsonVisitors(this.localInfo, 'updatedAt', false);

              // cleanup info 
              if(this.localInfo.length > 1000)
              {
                this.localInfo.splice(1000);
              }

              localStorage.setItem('info',await JSON.stringify(this.localInfo));
            }

          },
          error: error => {
            console.error('collect info error : ', error);
          }
        });

      localStorage.setItem('lastInfo_updated', await Utils.convDate(new Date()));
      
    }catch(e){
      console.error('Error api call: ', e)
    }
    
  }else{
    if(this.localInfo.length == 0 && localStorage.getItem('info')){
      this.localInfo = JSON.parse(localStorage.getItem('info'));
    }
    this.toolService.toastAlert('No hay acceso a internet',0,['Ok'],'middle')
  }

}

  lockToPortrait(){
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }


  async logout(){
    await this.showAlert('','', 'Deseas salir ?','btns', 'Si', 'No');
  }

  push_notifications(codeId:Number){
    this.toolService.toastAlert('Process code ' + codeId,0, ['Ok'],'bottom');
    
  }

  async openFamily(){
    const modal = await this.modalController.create({
      component: FamilyPage,
    });
  
    modal.present()
  }

  sendOpening(Door : string){
    if(Door == ''){
      // return 0;
    }else{
      this.msg = Door;
      this.sendSMS();
    }
  }


async openUrl(url:string){
  window.open(url)
}

// Send a text message using default options

async sendSMS(){
  if(this.msg == ''){
    this.toolService.toastAlert('Message empty !',0,['Ok'],'bottom')
    return;
  }
  var options:SmsOptions={
    replaceLineBreaks:false,
    android:{
      intent:''
    }
  }

  const local_sim =  await localStorage.getItem('my-core-sim');
  const use_twilio =  await localStorage.getItem('twilio');
  const uuid =  await localStorage.getItem('device-uuid');
  // const local_sim =  await this.storage.get('my-core-sim');

  this.sim = local_sim;
  this.msg = this.msg + ',' + uuid;


  if(!local_sim){
    // this.toolService.toastAlert('Privada sin Sim ',0, ['Ok'], 'bottom');
    this.toolService.showAlertBasic('Alerta','Privada sin Sim'
      ,'',['Ok'])
    return
  }

  try{

    this.loadingController.create({
      message: 'Abriendo ...',
      translucent: true
    }).then(async (res) => {
        res.present();
        if(use_twilio == 'false'){
          // Check if user is locked
          this.api.getData('api/users/notLocked/' + this.userId)
            .subscribe({
              next: async (res) => { 
                  await this.sms.send(this.sim,this.msg,options)
                  .then(() => this.loadingController.dismiss())
                  .catch((e:any) => {
                      this.loadingController.dismiss();
                      this.toolService.showAlertBasic('Alerta','Error',e,['Ok']);
                  });
              },
              error:async (err) => {
                this.loadingController.dismiss();
                await this.showAlert('','', 'Usuario bloqueado','btns', 'Ok','');
              }

            
          });
            
         
    
        }else{
          this.api.postData('api/twilio/open/' + 
          this.userId + '/' + this.msg + '/' + this.sim,'');
          this.loadingController.dismiss();
        }

    });
  }
  catch(e){
    this.toolService.showAlertBasic('Aviso','Ocurrio una excepción revisar:',
      `Error: ${e}`,['Cerrar']);
    
  }
}

async fcmNotification(){
  this.api.postData(`api/alerts/${localStorage.getItem('core-id')}/peatonal open/`,'')
}

async recoverAccount(){
  const modal = await this.modalController.create({
    component: RequestsPage,
    componentProps:{request:'UnblockAccount'}
  });
   await modal.present();
}


async deviceLost(){
  const modal = await this.modalController.create({
    component: RequestsPage,
    componentProps:{request:'deviceLost'}
  });
   await modal.present();
}

async newVisitor(){
  const modal = await this.modalController.create({
    component: VisitorListPage,
    // cssClass:"my-modal"
  });

  modal.present()
}

async lockUser(){

}

async newNeighbor(){
  const modal = await this.modalController.create({
    component: UpdUsersPage,
    componentProps:{
      'SourcePage': 'tab1NewNeighbor',
      'coreName': localStorage.getItem('core-name')
     }
  });
  
   await modal.present();
}


async ModalUsers(){
  const modal = await this.modalController.create({
    component: UsersPage,
    backdropDismiss: true,
    componentProps: {'CoreId' : this.coreId,
      'coreName':this.coreName}
  });

  modal.present()
}

//#region ---- Animation controller  ----------------------------------

async modalVisitors() {
  const enterAnimation = (baseEl: any) => {
    const backdropAnimation = this.animationController.create()
      .addElement(baseEl.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)')


    const wrapperAnimation = this.animationController.create()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' }
      ]);

    return this.animationController.create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(700)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  const leaveAnimation = (baseEl: any) => {
    return enterAnimation(baseEl).direction('reverse');
  }

  
  const modal = await this.modalController.create({
    component: VisitorListPage,
    enterAnimation,
    leaveAnimation,
    showBackdrop:false,
    // backdropDismiss: true,
    cssClass: "my-modal"
    // mode: 'md',
    // showBackdrop: false
  });
  
  return await modal.present();
}


async localNotification(){
  this.scheduleBasic('Peatonal abierta');
}

async scheduleBasic(msg:any){
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Core Alert',
        body: msg,
        id:2,
        summaryText: 'Priv. San Juan',
        extra:{
          data: 'Pass data to your handler'
        },
        iconColor:'#488AFF'
      }
    ]
  });
}
// #endregion  ---------------------------------------------

// -------   toast control alerts    ---------------------

async showAlert(Header:string, subHeader:string, msg:string, btns:any,
  txtConfirm:string, txtCancel:string) {
  const alert = await this.alertCtrl.create({
    header: Header,
    subHeader: subHeader,
    message: msg,
    backdropDismiss:false,
    buttons: [
      {
      text:txtCancel,
      role: 'cancel'
    },
    {
      text:txtConfirm,
      handler: async () =>{
        await this.api.logout();
        this.router.navigateByUrl('/',{replaceUrl:true});
        Utils.cleanLocalStorage();
            }
    
    }]
  });

  await alert.present();
}

}
