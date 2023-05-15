import { Component ,Input, OnInit} from '@angular/core';
import { ModalController, ToastController ,
  AnimationController, isPlatform, getPlatforms,
  PopoverController} from '@ionic/angular';
import type { ToastOptions } from "@ionic/angular";
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
// import { Sim } from "@ionic-native/sim/ngx"; 
import { Socket } from 'ngx-socket-io';
import { environment } from "../../environments/environment";
import { Device } from "@capacitor/device";
import { AuthenticationService } from './../services/authentication.service';
import { DatabaseService } from '../services/database.service';
import { Router } from '@angular/router';
import { VisitorsPage } from '../modals/visitors/visitors.page';
import { ScreenOrientation } from "@ionic-native/screen-orientation/ngx";
import { ScheduleOptions, LocalNotifications } from "@capacitor/local-notifications";
import {Utils } from "../tools/tools";
import { FamilyPage } from "../modals/family/family.page";
import { RequestsPage } from "../modals/requests/requests.page";
import localNotification from "../tools/localNotification";


// const DEVICE_UUID = 'device-uuid';

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
  public SoyAdmin=false;
  isAndroid:any;
  currentUser = '';
  public version = '';
  public coreName = '';
  twilio_client : any;
  userId : string;
  public socketId:string='SocketId';
  

  REST_API_SERVER = environment.cloud.server_url;

  constructor(
    private sms: SMS,
    private toast: ToastController,
    public modalController: ModalController,
    private api: DatabaseService,
    public animationController : AnimationController,
    private router: Router,
    private screenOrientation: ScreenOrientation,
    private socket: Socket,
    // private SIM : Sim,
    private popoverCtrl:PopoverController) { }
  
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
            
   

    

     // ---- socket  -------------------------
    // this.socket.connect();
  
    // this.socket.emit('join', sim)
    // this.socket.on('msg', async (msg:string) =>{
    //   await this.presentToast({
    //     message : 'msg. recivido del socket --> ' + msg,
    //     duration: 10000,
    //     buttons:[
    //       {text: 'Ok'}
    //     ]
    //   });

    //   this.scheduleBasic('msg. recivido del socket --> ');

    //   console.log('msg. recivido del socket --> ', msg)
    // });

    // let name = `User-${new Date().getTime()}`;
    // this.currentUser = name;

    // this.socket.emit('set-name',this.userId['value']);
    // this.socket.fromEvent('users-changed').subscribe((data:any) => {
    //   console.log('got users-changed data: ', JSON.stringify(data));
    // });

    // this.socket.fromEvent('alert').subscribe((data:any) => {
    //   console.log('got alert data: ', data);
    //   this.scheduleBasic(data);
    // });



      // ----------------  version reciente  -------------
   await this.socketInit();

// -----------------------------------------------

// this.init();
this.version = environment.app.version;

    console.log('getPlatform --> ', JSON.stringify(getPlatforms()));
    if(isPlatform('cordova') || isPlatform('ios')){
      this.lockToPortrait();
    }else if(isPlatform('android')){
      this.isAndroid = true;
    }

    // getting info data
    if(environment.app.debugging){
      console.log('collect Info jumped, because debugging!');
      await this.presentToast({
        message : 'collect Info jumped, because debugging!',
        duration: 10000,
        buttons:[
          {text: 'Ok'}
        ]
      });
    }else{
      this.collectInfo();
    }

  }

//   async init(): Promise<void> {
//     await this.SIM.hasReadPermission().then(async allowed =>{
//       if(!allowed){
//         console.log('Si entre init sim has read permissions')
//         await this.SIM.requestReadPermission().then( 
//         async () => {
//             await this.SIM.getSimInfo().then(
//             (info) => console.log('Sim info: ', info),
//             (err) => console.log('Unable to get sim info: ', err)
//           );
//            },
//         () => console.log('Permission denied')
//         )
//       }
//     });
  
//      const info = await Device.getInfo();
//      console.log('tab1.page SIM info --> ' , info);
//      localStorage.setItem(DEVICE_UUID, (await Device.getId()).uuid);

//      if (info.platform === 'android') {
//        try {
//          console.log('soy android OK');
//        } catch (e) {
//          console.log('soy android con Error: ', e);
//      }
//    }else{
//      console.log('no soy android');
//    }
//  }

 async socketInit(){
  await this.socket.on('connect', async ()=>{
    this.socketId = await this.socket.ioSocket.id;

    console.log('socket connected: ', this.socket.ioSocket.id);

    // // DEbugging
    // this.coreName = await this.coreName + '\n\r ' + this.socketId;
    // console.log('coreName: ', this.coreName);
    try{

      await this.socket.emit('join',localStorage.getItem('core-id'));
    }catch(ex){
      console.log('Error socket join to room: ', ex);
    }
  });

  await this.socket.on('joined', (msg:string)=>{
      console.log(msg);
  });


  await this.socket.on('Alert',async (msg:any)=>{
    console.log('Alert --> ' + new Date().toLocaleString(), msg);
  await  localNotification(msg);
  });

  this.socket.on('disconnect', () => {
    console.log('socket disconnected ' + new Date().toLocaleString());
  });

  this.socket.on("connect_error", (err:any) => {
    console.log(`connect_error due to ${err.message}`);
  });

 }

 async doRefresh(event:any){
  this.collectInfo();

  setTimeout(() => {
    event.target.complete();
  }, 2000);
}


async presentToast(opts: ToastOptions) {
  const toast = await this.toast.create(opts);

  await toast.present();
}


async collectInfo(){
 await this.api.getData('api/info/' + this.userId).subscribe(async result => {
    this.localInfo = await result;
  });

}
  lockToPortrait(){
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
  }


  async logout(){
    await this.api.logout();
    this.router.navigateByUrl('/',{replaceUrl:true});
    Utils.cleanLocalStorage();
  }

  loadCodes() {
    // this.api.getCodeList().subscribe(res => {
    //   this.codes = res.values;
    //   console.log(JSON.stringify(this.codes));
    // });
    
      this.api.getData('/api/codes').subscribe(result =>{
          alert(JSON.stringify(result));
      });


  // console.log('to feed html..' + this.api.getCodeList().(res => {
  //     this.codes = res.values;
  //     console.log(JSON.stringify(this.codes));
  //   })

  }

  push_notifications(codeId:Number){
    this.toastEvent('Process code ' + codeId);
    
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
    const toast = await this.toast.create({
      message : 'Message empty !',
      duration: 3000
    });
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
      console.log('send clicked..')
      await this.sms.send(this.sim,this.msg,options);
    }else{
      console.log('url -- >   api/twilio/open/' + this.userId + '/' + 
      this.msg + '/' + this.sim);
      this.api.postData('api/twilio/open/' + 
      this.userId + '/' + this.msg + '/' + this.sim,'')
    }
    
      const toast = await this.toast.create({
        message : 'Text [ ' + JSON.stringify(this.msg) +  ' ] was sent !',
        duration: 3000
      });
        toast.present();
  }
  catch(e){
    console.log('Text was not sent --> ', JSON.stringify(e));
    const toast = await this.toast.create({
      message : 'Comando no se envio : ' + JSON.stringify(e),
      duration: 3000
    });
      toast.present();
    }
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


async socketCheck(){
  this,this.socket.emit('check','Just checking socket connection');
}

async newModal(){
  const modal = await this.modalController.create({
    component: VisitorsPage,
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
    component: VisitorsPage,
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
  this. scheduleBasic('Peatonal abierta');
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
toastEvent(msg:string){
  this.myToast = this.toast.create({
    message:msg,
    duration:2000
  }).then((toastData) =>{
    console.log(toastData);
    toastData.present();
  });
}

}
