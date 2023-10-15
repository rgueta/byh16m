import { Component, OnInit } from '@angular/core';
import { ModalController, AnimationController,
        ToastController, AlertController} from "@ionic/angular";
import { UpdCoresPage } from "../../modals/upd-cores/upd-cores.page";
import { UsersPage } from '../../modals/users/users.page';
import { DatabaseService } from '../../services/database.service';
import { UpdCpusPage } from "../../modals/upd-cpus/upd-cpus.page";
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { InfoPage } from "../../modals/info/info.page";

const TWILIO = 'twilio';
const EMAIL_TO_VISITOR = 'emailToVisitor'
const EMAIL_TO_CORE = 'emailToCore'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})

export class AdminPage implements OnInit {
  public CoresList:any;
  public myUserList:any;
  automaticClose = false;
  public userId : any;
  myToast:any;
  public routineOpen=false;
  localenable:boolean=true;
  visitorId:string='';
  emailToVisitor: boolean = true;


  constructor(
        public animationController : AnimationController,
        public modalController : ModalController,
        public api : DatabaseService,
        private sms: SMS,
        private toast: ToastController,
        public alertCtrl: AlertController,
        // public routerOutlet :IonRouterOutlet 
    ) {
      
     }

  async ngOnInit() {
    this.emailToVisitor = await (localStorage.getItem('emailToVisitor') === 'true');

    console.log('emailToVisitor value --> ', this.emailToVisitor);
    this.getCores();
  }

  async getCores(){
    this.userId = await localStorage.getItem('my-userId');
    await this.api.getData('api/cores/admin/'  + this.userId).subscribe(async result =>{
      this.CoresList = await result;
      this.CoresList[0].open = true;
    },error => {
      console.log('Error response --> ', error)
    });
    
  }

  async doRefresh(event:any){
    this.getCores();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async closeModal(){
    await this.modalController.dismiss({'msg':'just to call onDidDismiss'});
  } 

  async modalRegister(CoreId:string,CoreName:string, pathLocation:string) {

    const modal = await this.modalController.create({
      component: UsersPage,
      componentProps:{
        'CoreName':CoreName,
        'CoreId': CoreId,
        'pathLocation': pathLocation
       }
    });

    return await modal.present();
  }  

  async modalUpdCores() {
    const modal = await this.modalController.create({
      component: UpdCoresPage,
      backdropDismiss: true,
      componentProps: {retorno: Boolean}
    });

    modal.onDidDismiss()
    .then(async (data) =>{
      if(data.data) {
        this.getCores();
      }
    });
  
    modal.present();
  
  }

  async modalUpdCpus() {
    const modal = await this.modalController.create({
      component: UpdCpusPage,
    });
    return await modal.present();
  
  }

  async modalUpdInfo(){
    const modal = await this.modalController.create({
      component : InfoPage
    });
    return await modal.present()
  }



  async getSIMstatus(){
     // Send a text message using default options
    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }

    // const sim =  await this.storage.get('my-core-sim');
    const sim =  await localStorage.getItem('my-core-sim');
    let alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Request module status?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'icon-color',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          cssClass: 'icon-color',
          handler: async data => {
            try{

              await this.sms.send(sim,'status,sim',options);

              // alert('Text was sent !')
                const toast = await this.toast.create({
                  message : 'msg sent to ' + sim,
                  duration: 3000
                });
        
                  toast.present();
          }catch(e){
            const toast = await this.toast.create({
              message : 'Text was not sent !.. error: ' + e,
              duration: 3000
            });
              toast.present();
          }

          }
        }
      ]
    });

    await alert.present();
  }

  async ModuleRST(){
    // Send a text message using default options

   var options:SmsOptions={
     replaceLineBreaks:false,
     android:{ intent:'' }
   }
   
   const sim =  await localStorage.getItem('my-core-sim');
   let alert = await this.alertCtrl.create({
    header: 'Confirm',
    message: 'Reset module ?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'icon-color',
      },
      {
        text: 'Yes',
        cssClass: 'icon-color',
        handler: async data => {
          try{
            await this.sms.send(sim,'rst,sim',options);
            const toast = await this.toast.create({
              message : 'msg sent to ' + sim,
              duration: 3000
            });
            toast.present();

          }catch(e){
            const toast = await this.toast.create({
              message : 'Text was not sent !.. error: ' + e,
              duration: 3000
            });
              toast.present();
          }
        }
      }
    ]
  });
  await alert.present();
 }

  async getCoreCodes(){
    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }
    
    // const sim =  await this.localStorage.getItem('my-core-sim');
    const sim =  await localStorage.getItem('my-core-sim');


    let alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Request codes from module?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'icon-color',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          cssClass: 'icon-color',
          handler: async data => {
            try{
              await this.sms.send(sim,'active_codes,sim',options);
        
              // alert('Text was sent !')
                const toast = await this.toast.create({
                  message : 'msg sent to ' + sim,
                  duration: 3000
                });
        
                  toast.present();
                
            }
            catch(e){
              // alert('Text was not sent !')
              const toast = await this.toast.create({
                message : 'Text was not sent !.. error: ' + e,
                duration: 3000
              });
        
                toast.present();
              }
          }
        }
      ]
    });

    await alert.present();


  }

  async setupCode(visitorId:string){}

      // ---- Animation controller  ----------------------------------

  async collectUsers(coreId:string,core:string) {
    const modal = await this.modalController.create({
      component: UsersPage,
      backdropDismiss: true,
      componentProps: {'CoreId' : coreId,'coreName':core}
    });

    modal.onDidDismiss()
    // .then(async (data) =>{
    //   if(data.data) {
    //     this.getCores();
    //   }
    // });
  
    modal.present();
  }

  async chgStatusCore(event:any,coreStatus:any, id:string, name:string) {
    let element = <HTMLInputElement> document.getElementById("disableToggle");
    let titleMsg = 'Disable ';
    console.log('event -->' ,event)
    console.log('coreStatus --> ', coreStatus)

    if(event.target.checked)
    {
      titleMsg = 'Enable ';
    }
    if(event.target.checked != coreStatus){
      let alert = await this.alertCtrl.create({
        header: 'Confirm',
        message: titleMsg + '[ ' + name + ' ] core ?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'icon-color',
            handler: () => {
              element.checked = !event.target.checked;
            }
          },
          {
            text: 'Ok',
            cssClass: 'icon-color',
            handler: async data => {
              if(event.target.checked){
                await this.api.postData('api/cores/enable/',{'coreId' : id}).then(async (onResolve) =>{
                  await this.getCores();
                },
                (onReject) =>{
                  console.log('Can not enable core, ', onReject);
                });
              }else{
                console.log('api/cores/disable/',{'coreId': id})
                await this.api.postData('api/cores/disable/',{'coreId' : id}).then(async (onResolve) =>{
                  await this.getCores();
                },
                (onReject) =>{
                  console.log('Can not disable core, ', onReject);
                });
              }
                
            }
          }
        ]
      });

    await alert.present();
    }
  }

  async TwilioToggleEven($event:any){
    if($event.detail.checked){
      console.log('Usar twilio');
      await localStorage.setItem(TWILIO,'true');
    }else{
      console.log('Usar Sim');
      await localStorage.setItem(TWILIO,'false');
    }
  }

  async EmailVisitorToggleEven($event:any){
    if($event.detail.checked){
      await localStorage.setItem(EMAIL_TO_VISITOR,'true');
    }else{
      await localStorage.setItem(EMAIL_TO_VISITOR,'false');
    }
  }

  async EmailCoreToggleEven($event:any){
    if($event.detail.checked){
      await localStorage.setItem(EMAIL_TO_CORE,'true');
    }else{
      await localStorage.setItem(EMAIL_TO_CORE,'false');
    }
  }

  async modalUpdCity(){
    this.toastEvent('Process new city ');
  }

// region Main Accordion list  --------------------------------------

  toggleSection(index:number){
    this.CoresList[index].open = !this.CoresList[index].open;
    if(this.automaticClose && this.CoresList[index].open){
      this.CoresList
      .filter((item:{}, itemIndex:number) => itemIndex != index)
      .map((item:any) => item.open = false);
    }
  }

  toggleItem(index:number, childIndex:number){
    this.CoresList[index].children[childIndex].open = !this.CoresList[index].open;
  }

// end region

// region Routines Accordion list  --------------------------------------

toggleSectionRoutines(){
  this.routineOpen = !this.routineOpen
  
}


// end region

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
