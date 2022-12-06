import { Component, OnInit } from '@angular/core';
import { ModalController, AnimationController,
        ToastController, AlertController, 
        IonRouterOutlet  } from "@ionic/angular";
import { UpdCoresPage } from "../../modals/upd-cores/upd-cores.page";
import { UsersPage } from '../../modals/users/users.page';
import { DatabaseService } from '../../services/database.service';
import { UpdUsersPage } from "../../modals/upd-users/upd-users.page";
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { Storage } from "@capacitor/core";
import { InfoPage } from "../../modals/info/info.page";

const TWILIO = 'twilio';

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

  ngOnInit() {
    
    this.getCores();
  }

  async getCores(){
    this.userId = await Storage.get({key : 'my-userId'});
    await this.api.getData('api/cores/admin/'  + this.userId['value']).subscribe(async result =>{
      this.CoresList = await result;
      this.CoresList[0].open = true;
      console.table('Core table --> ', this.CoresList);
    });
    
  }

  async doRefresh(event){
    this.getCores();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async closeModal(){
    await this.modalController.dismiss({'msg':'just to call onDidDismiss'});
  } 

  async modalRegister(CoreId,CoreName, pathLocation) {
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
      component: UsersPage,
      componentProps:{
        'CoreName':CoreName,
        'CoreId': CoreId,
        'pathLocation': pathLocation,
      },
      enterAnimation,
      leaveAnimation
    });

    return await modal.present();
  }  

  async modalUpdCores() {
    const modal = await this.modalController.create({
      component: UpdCoresPage
    });
    return await modal.present();
  
  }

  async modalUpdInfo(){
    const modal = await this.modalController.create({
      component : InfoPage
    });
    return await modal.present()
  }

  async modalUpdCores_() {
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

    let modal = await this.modalController.create({
      component: UpdCoresPage,
      enterAnimation,
      leaveAnimation
    });

   modal.onDidDismiss().then((data) => {
     console.log(data);
      this.getCores();
    });

    return await modal.present();
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
    const sim =  await Storage.get({key : 'my-core-sim'});
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

              await this.sms.send(sim.value,'status,sim',options);

              // alert('Text was sent !')
                const toast = await this.toast.create({
                  message : 'msg sent to ' + sim.value,
                  duration: 3000
                });
        
                  toast.present();
          }catch(e){
            const toast = await this.toast.create({
              message : 'Text was not sent !.. error: ' + e.message,
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
   
   const sim =  await Storage.get({key : 'my-core-sim'});
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
            await this.sms.send(sim.value,'rst,sim',options);
            const toast = await this.toast.create({
              message : 'msg sent to ' + sim.value,
              duration: 3000
            });
            toast.present();

          }catch(e){
            const toast = await this.toast.create({
              message : 'Text was not sent !.. error: ' + e.message,
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
    
    // const sim =  await this.storage.get('my-core-sim');
    const sim =  await Storage.get({key : 'my-core-sim'});


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
              await this.sms.send(sim.value,'active_codes,sim',options);
        
              // alert('Text was sent !')
                const toast = await this.toast.create({
                  message : 'msg sent to ' + sim.value,
                  duration: 3000
                });
        
                  toast.present();
                
            }
            catch(e){
              // alert('Text was not sent !')
              const toast = await this.toast.create({
                message : 'Text was not sent !.. error: ' + e.message,
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

      // ---- Animation controller  ----------------------------------

  async collectUsers(id,core) {
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
      component: UpdUsersPage,
      componentProps:{
        'Core':core,
        'CoreId': id
      },
      enterAnimation,
      leaveAnimation
    });
    return await modal.present();
  }

  async chgStatusCore(event,coreStatus, id, name) {
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

  async TwilioToggleEven($event){
    if($event.detail.checked){
      console.log('Usar twilio');
      await Storage.set({key: TWILIO, value: 'true'});
    }else{
      console.log('Usar Sim');
      await Storage.set({key: TWILIO, value: 'false'});
    }
  }


  async modalUpdCity(){
    this.toastEvent('Process new city ');
  }

// region Main Accordion list  --------------------------------------

  toggleSection(index){
    this.CoresList[index].open = !this.CoresList[index].open;
    if(this.automaticClose && this.CoresList[index].open){
      this.CoresList
      .filter((item, itemIndex) => itemIndex != index)
      .map(item => item.open = false);
    }
  }

  toggleItem(index, childIndex){
    this.CoresList[index].children[childIndex].open = !this.CoresList[index].open;
  }

// end region

// region Routines Accordion list  --------------------------------------

toggleSectionRoutines(){
  this.routineOpen = !this.routineOpen
  
}


// end region

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
