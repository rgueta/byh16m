import { Component, Input } from '@angular/core';
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { IonSearchbar, ModalController, ToastController ,
         AnimationController, isPlatform, Platform, 
         AlertController, getPlatforms} from '@ionic/angular';
import { environment } from "../../environments/environment";
import { DatabaseService } from '../services/database.service';
import { VisitorsPage } from '../modals/visitors/visitors.page';
import { ChildActivationStart, Router } from '@angular/router';
import { AuthenticationService } from './../services/authentication.service';
import { ScreenOrientation } from "@ionic-native/screen-orientation/ngx";
import { Plugins, LocalNotificationEnabledResult,
        LocalNotificationActionPerformed,LocalNotification } from '@capacitor/core';
import { Sim } from "@ionic-native/sim/ngx"; 

import { Socket } from 'ngx-socket-io';
import { Storage } from "@capacitor/core";
import { ConstantPool } from '@angular/compiler';


const { LocalNotifications, Device } = Plugins;
const DEVICE_UUID = 'device-uuid';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {
  public localInfo:any;
  public codes = [];
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
  userId : any;
  

  REST_API_SERVER = environment.db.server_url;
  

  constructor(private authService: AuthenticationService,
    private sms: SMS,
    private toast: ToastController,
    public modalController: ModalController,
    private api: DatabaseService,
    public animationController : AnimationController,
    private router: Router,
    private screenOrientation: ScreenOrientation,
    private socket: Socket,
    private alertController: AlertController,
    private platform : Platform,
    private SIM : Sim
    ) {

    }
    async ngOnInit(){
            
      this.init();
      this.version = environment.app.version;
      await LocalNotifications.requestPermission();

      const sim = await Storage.get({key:'my-core-sim'});
      this.userId = await Storage.get({key:'my-userId'});
      await Storage.get({key:'core-name'}).then(val_coreName => {
        this.coreName = val_coreName.value;
      });

  

      console.log('core Name --> ' + this.coreName);
      // const sim = await this.storage.get('my-core-sim');
      // const userId = await this.storage.get('my-userId');

       // ---- socket  -------------------------
      this.socket.connect();
      this.socket.emit('create', sim)
      let name = `User-${new Date().getTime()}`;
      this.currentUser = name;

      this.socket.emit('set-name',this.userId['value']);
      this.socket.fromEvent('users-changed').subscribe(data => {
        console.log('got users-changed data: ', data);
      });

      this.socket.fromEvent('alert').subscribe(data => {
        console.log('got alert data: ', data);
        this.scheduleBasic(data);
      });
// -----------------------------------------------
      console.log('getPlatform --> ', JSON.stringify(getPlatforms()));
      if(isPlatform('cordova') || isPlatform('ios')){
        this.lockToPortrait();
      }else if(isPlatform('android')){
        this.isAndroid = true;
      }
      // getting info data
      this.collectInfo()

    }


    async init(): Promise<void> {

     await this.SIM.getSimInfo().then(
        (info) => console.log('Sim info: ', info),
        (err) => console.log('Unable to get sim info: ', err)
      );

      // console.log('SIM info --> ' , this.SIM.getSimInfo());
      
      const info = await Device.getInfo();
      await Storage.set({key: DEVICE_UUID, value: info.uuid});
      // console.log('info uuid--> ', info.uuid);
      // console.log('Platform --> ', this.platform.platforms);
      if (info.platform === 'android') {
        // console.log('info uuid--> ', info.uuid);
        try {
          console.log('soy android');
    //       const sqlite = CapacitorSQLite as any;
    //       // await sqlite.requestPermissions();
    //       this.setupDatabase();
        } catch (e) {
          console.log('no soy android');
    //       const alert = await this.alertCtrl.create({
    //         header: 'No DB access',
    //         message: 'This app can\'t work without Database access.',
    //         buttons: ['OK']
    //       });
    //       await alert.present();
    //     }
    //   } else {
    //     this.setupDatabase();
      }
    }else{
      console.log('no soy android');
    }

     
  
  }

  async doRefresh(event){
    this.collectInfo();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async collectInfo(){
   await this.api.getData('api/info/' + this.userId['value']).subscribe(async result => {
      this.localInfo = await result;
    });

    console.log('UserID --> ', this.userId['value'])
  }
    lockToPortrait(){
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }


    async logout(){
      await this.authService.logout();
      this.router.navigateByUrl('/',{replaceUrl:true});
      // Storage.clear();
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

    sendOpening(Door : string){
      if(Door == ''){
        return 0;
      }else{
        this.msg = Door;
        this.sendSMS();
      }
    }


  async openUrl(url){
    window.open(url)
  }

  // Send a text message using default options
  async sendSMS(){
    if(this.msg == ''){
      const toast = await this.toast.create({
        message : 'Message empty !',
        duration: 3000
      });
      return 0;
    }
    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }

    const local_sim =  await Storage.get({key:'my-core-sim'});
    const use_twilio =  await Storage.get({key:'twilio'});
    const uuid =  await Storage.get({key:'device-uuid'});
    // const local_sim =  await this.storage.get('my-core-sim');

  this.sim = local_sim.value;
  this.msg = this.msg + ',' + uuid.value;

  try{
    if(use_twilio.value == 'false'){
      await this.sms.send(this.sim,this.msg,options);
    }else{
      console.log('url -- >   api/twilio/open/' + this.userId['value'] + '/' + 
      this.msg + '/' + this.sim);
      this.api.postData('api/twilio/open/' + 
      this.userId['value'] + '/' + this.msg + '/' + this.sim,'')
    }
    
      const toast = await this.toast.create({
        message : 'Text [ ' + JSON.stringify(this.msg) +  ' ] was sent !',
        duration: 3000
      });
        toast.present();
  }
  catch(e){
    // alert('Text was not sent !')
    const toast = await this.toast.create({
      message : 'Comando no se envio : ' + JSON.stringify(e),
      duration: 3000
    });
      toast.present();
    }
    
  }


  //#region region---- Animation controller  ----------------------------------

  async modalVisitors() {
    const enterAnimation = (baseEl: any) => {
      const backdropAnimation = this.animationController.create()
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');


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
      backdropDismiss: true,
      cssClass: "my-modal"
      // mode: 'md',
      // showBackdrop: false
    });
    return await modal.present();
  }

  async scheduleBasic(msg){
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Core Alert',
          body: msg,
          id:1,
          extra:{
            data: 'Pass data to your handler'
          },
          iconColor:'#0000FF'
        }
      ]
    });
  }
  // #endregion  ---------------------------------------------

  // -------   toast control alerts    ---------------------
  toastEvent(msg){
    this.myToast = this.toast.create({
      message:msg,
      duration:2000
    }).then((toastData) =>{
      console.log(toastData);
      toastData.present();
    });
  }


}

