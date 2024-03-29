import { Component ,Input, OnInit} from '@angular/core';
import { ModalController ,AnimationController, isPlatform,
  PopoverController, AlertController} from '@ionic/angular';
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { environment } from "../../environments/environment";
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { VisitorListPage } from '../modals/visitor-list/visitor-list.page';
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

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  public localInfo:any;
  public codes : [];
  @Input() msg:string;
  @Input() sim:string;
  myToast:any;
  myRoles:any;
  public SoyAdmin: boolean = false;
  isAndroid:any;
  currentUser = '';
  public version = '';
  public coreName = '';
  twilio_client : any;
  userId : string;
  id : number = 0;
  public visible : boolean = true;
  infoPanel : any;
  
  REST_API_SERVER = environment.cloud.server_url;

  iosOrAndroid: boolean;

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
    private toolService: ToolsService) { }
  
  async ionViewWillEnter(){
      if(localStorage.getItem('IsAdmin') === 'true'){
        this.SoyAdmin = true;
      }else{
        this.SoyAdmin = false;
      }
  }

  async ngOnInit(){
    const sim = await localStorage.getItem('my-core-sim');
    this.userId = await localStorage.getItem('my-userId');
    this.coreName = await localStorage.getItem('core-name')

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

toggleButtons(){
  this.visible = !this.visible;
  
  if(this.visible){
    this.infoPanel.style.marginTop = "115px";
  }else{
    this.infoPanel.style.marginTop = "0px";
  }

}

async collectInfo(){
  let timestamp = '';
  if(!localStorage.getItem('lastInfo_updated')){
    timestamp = Utils.convDate(new Date());
  }else{
    timestamp = localStorage.getItem('lastInfo_updated');
  }

  if(await this.toolService.verifyNetStatus()){
    try{
    
      await this.api.getData('api/info/' + this.userId + 
        '/2020-01-29T00:49:49.857Z').subscribe({
          next: async result => {
            this.localInfo = await result;
            debugger
            console.log('localInfo -->', this.localInfo)
          },
          error: error => {
            console.error('collect info error : ', error);
          }
        });
     
      localStorage.setItem('lastInfo_updated', await Utils.convDate(new Date()));
    }catch(e){
    }
    
  }else{
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

  try{
    if(use_twilio == 'false'){
      console.log('Aqui llegue..!');
      await this.sms.send(this.sim,this.msg,options);
    }else{
      this.api.postData('api/twilio/open/' + 
      this.userId + '/' + this.msg + '/' + this.sim,'')
    }
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

async newModal(){
  const modal = await this.modalController.create({
    component: VisitorListPage,
    // cssClass:"my-modal"
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
    buttons: [{
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
