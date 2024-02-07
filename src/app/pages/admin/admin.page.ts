import { Component, OnInit } from '@angular/core';
import { ModalController, AnimationController,
        ToastController, AlertController} from "@ionic/angular";
import { UpdCoresPage } from "../../modals/upd-cores/upd-cores.page";
import { UsersPage } from '../../modals/users/users.page';
import { DatabaseService } from '../../services/database.service';
import { UpdCpusPage } from "../../modals/upd-cpus/upd-cpus.page";
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { InfoPage } from "../../modals/info/info.page";
import { ToolsService } from "../../services/tools.service";

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
  public simSectionOpen = false;
  sim:string;
  public core_sim:string;

  constructor(
        public animationController : AnimationController,
        public modalController : ModalController,
        public api : DatabaseService,
        private sms: SMS,
        // private toast: ToastController,
        public alertCtrl: AlertController,
        // public routerOutlet :IonRouterOutlet 
        private toolService:ToolsService
    ) {}

  async ngOnInit() {
    this.core_sim = await localStorage.getItem('my-core-sim');
    this.userId = await localStorage.getItem('my-userId');
    this.emailToVisitor = await (localStorage.getItem('emailToVisitor') === 'true');

    console.log('emailToVisitor value --> ', this.emailToVisitor);
    this.getCores();
  }

  async getCores(){
    await this.api.getData('api/cores/admin/'  + this.userId).subscribe(async result =>{
      this.CoresList = await result;
      this.CoresList[0].open = true;
    },error => {
      console.log('Error response --> ', JSON.stringify(error))
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

  async getSIMstatus(event:any,item:any){
    this.alertCtrlEvent(event, item,'Confirm', 'Request module status?',
    'getSIMstatus', 'Yes', 'Cancel');
  }

  async ModuleRST(event:any, item:any){
   this.alertCtrlEvent(event,item,'Configm','Reset module ?','ModuleRST','Yes','Cancel')
 }

  async getCoreCodes(event:any,item:any){
    this.alertCtrlEvent(event,item,'Confirm','Request codes from module?',
    'getCoreCodes','Yes','Cancel');
  }

  async setOpenGate(event:any,item:any){
    this.alertCtrlEvent(event,item,'Confirm','Open gate with code?','setOpenGate','Yes','Cancel')
  }

  async setOpenMagnet(event:any,item:any){
    this.alertCtrlEvent(event,item,'Confirm','Open magnet with code?','setOpenMagnet','Yes','Cancel');
  }

  async setKeypad(event:any,item:any,keypad:string){
    item['keyPadName'] = keypad;
    this.alertCtrlEvent(event,item,'Confirm','Set keypad ' + keypad + ' ?','setKeypad','Yes','Cancel');
  }
  async simChange(event:any,item:any){
   this.alertCtrlEvent(event,item,'Confirm','New sim: '+ this.sim + ' ?', 'simChange', 'Yes','Cancel');
 }

  async setupCode(visitorId:string){}

  async collectUsers(coreId:string,core:string) {
    const modal = await this.modalController.create({
      component: UsersPage,
      backdropDismiss: true,
      componentProps: {'CoreId' : coreId,'coreName':core}
    });

    modal.onDidDismiss()
    modal.present();
  }

  async chgStatusCore(event:any,item:any) {
    let element = <HTMLInputElement> document.getElementById("disableToggle");
    let titleMsg = 'Disable ';

    if(event.target.checked)
    {
      titleMsg = 'Enable ';
    }
    if(event.target.checked != item.enable){
      this.alertCtrlEvent(event,item,'Confirm', titleMsg + ' ' + item.name + ' ?',
       'chgStatusCore', 'Yes', 'Cancel')
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
    this.toolService
    this.toolService.toastAlert('Process new city ',0, ['Ok'], 'bottom');
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

// region sim Section Routine -------------------------------
toggleSectionSim(){
  this.simSectionOpen = !this.simSectionOpen
}

// endregion   --------------------------------------------

//region ------- alert controlers region   ---------------------

  async alertCtrlEvent(event:any,item:any,titleMsg:string,Message:string,option:string, txtConfirm:string, txtCancel:string){
    let element = <HTMLInputElement> document.getElementById("disableToggle");
    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    } 

    let alert = await this.alertCtrl.create({
      header: titleMsg,
      message: Message,
      buttons: [
        {
          text: txtCancel,
          role: 'cancel',
          cssClass: 'icon-color',
          handler: () => {
            switch(option){
              case 'chgStatusCore':
                element.checked = !event.target.checked;
                break;
              default:
                break;
            }
          }
        },
        {
          text: txtConfirm,
          cssClass: 'icon-color',
          handler: async data => {
            switch(option){
              case 'chgStatusCore':
                if(event.target.checked){
                  await this.api.postData('api/cores/enable/' + this.userId,{'coreId' : item._id}).then(async (onResolve) =>{
                    await this.getCores();
                  },
                  (onReject) =>{
                    console.log('Can not enable core, ', JSON.stringify(onReject));
                  });
                }else{
                  console.log('api/cores/disable/',{'coreId': item._id})
                  await this.api.postData('api/cores/disable/' + this.userId,{'coreId' : item._id}).then(async (onResolve) =>{
                    await this.getCores();
                  },
                  (onReject) =>{
                    console.log('Cannot disable core, error: ', JSON.stringify(onReject));
                  });
                }
              break;
              case 'simChange':
                try{
                  if (this.sim.length >= 10 ){
                    console.log('chgSim API params --> ' ,this.userId + ',' + item._id + ',' + this.sim);
                    await this.api.postData('api/cores/chgSim/' + this.userId ,{'coreId':item._id, 'newSim':this.sim}).then(async (result) => {
                      this.getCores();
                      this.simSectionOpen = false;
                    }, error => {
                      this.toolService.toastAlert('chgSim API error: ' + JSON.stringify(error),0,['Ok'],'bottom');
                    });
    
                    this.toolService.toastAlert('Sim changed to ' + this.sim,0, ['Ok'], 'bottom')
                  }else{
                    this.toolService.toastAlert('Invalid format',0, ['Ok'], 'bottom')
                  }
      
                }catch(e){
                  this.toolService.toastAlert('Sim not changed, error: ' 
                    + JSON.stringify(e),0, ['Ok'], 'bottom');
                }
                break;
              case 'getSIMstatus':
                try{
                  await this.sms.send(this.core_sim,'status,sim',options);
                  this.toolService.toastAlert('Msg. sent to ' + this.core_sim,0, ['Ok'], 'bottom');
                }catch(e){
                  this.toolService.toastAlert('Not sent, error: ' + JSON.stringify(e),0, ['Ok'], 'bottom');
                }
                break;
              case 'ModuleRST':
                try{
                    await this.sms.send(item.Sim,'rst,sim',options);
                    this.toolService.toastAlert('Msg sent to ' + item.Sim,0, ['Ok'], 'bottom');
                }catch(e){
                  this.toolService.toastAlert('Not sent, error: ' + JSON.stringify(e),0, ['Ok'], 'bottom');
                }
                break;
              case 'getCoreCodes':
                try{
                  await this.sms.send(item.Sim,'active_codes,sim',options);
                  this.toolService.toastAlert('msg sent to ' + item.Sim,0, ['Ok'], 'bottom');
                }
                catch(e){
                  this.toolService.toastAlert('Not sent, error: ' + JSON.stringify(e),0, ['Ok'], 'bottom');
                  }
                break;
              case 'setOpenGate':
                try{
                  await this.sms.send(item.Sim,'setOpenCode,gate',options);
                  this.toolService.toastAlert('msg sent to ' + item.Sim,0, ['Ok'], 'bottom');
                }
                catch(e){
                  this.toolService.toastAlert('Not sent, error: ' + JSON.stringify(e),0, ['Ok'], 'bottom');
                  }
                break;
              case 'setOpenMagnet':
                try{
                  await this.sms.send(item.Sim,'setOpenCode,magnet',options);
                  this.toolService.toastAlert('msg sent to ' + item.Sim,0, ['Ok'], 'bottom');
                }
                catch(e){
                  this.toolService.toastAlert('Not sent, error: ' + JSON.stringify(e),0, ['Ok'], 'bottom');
              }
              break;
              case 'setKeypad':
                try{
                  await this.sms.send(item.Sim,'setKeypad,' + item.keyPadName,options);
                  this.toolService.toastAlert('msg sent to ' + item.Sim,0, ['Ok'], 'bottom');  
                }
                catch(e){
                    this.toolService.toastAlert('Not sent, error: ' + JSON.stringify(e),0, ['Ok'], 'bottom');
                  }
                break;
            }
          }
        }
      ]
    });

    await alert.present();

  }

//endregion
}
