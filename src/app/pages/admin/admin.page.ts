import { Component, OnInit } from '@angular/core';
import { ModalController, AnimationController,
         AlertController} from "@ionic/angular";
import { UpdCoresPage } from "../../modals/upd-cores/upd-cores.page";
import { UsersPage } from '../../modals/users/users.page';
import { DatabaseService } from '../../services/database.service';
import { UpdCpusPage } from "../../modals/upd-cpus/upd-cpus.page";
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { InfoPage } from "../../modals/info/info.page";
import { ToolsService } from "../../services/tools.service";
import { UpdUsersPage } from "../../modals/upd-users/upd-users.page";
import { BackstagePage } from "../../modals/backstage/backstage.page";

const TWILIO = 'twilio';
const EMAIL_TO_VISITOR = 'emailToVisitor'
const EMAIL_TO_CORE = 'emailToCore'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})

export class AdminPage implements OnInit {
  routineOptions = [
    {'id':0,'cmd':'ModuleRST','name':'Reboot module','confirm':'Reboot module ?'},
    {'id':1,'cmd':'getSIMstatus','name':'Module status','confirm':'Request module status?'},
    {'id':2,'cmd':'RestraintStatus','name':'Restraint status','confirm':'Request restraint status?'},
    {'id':3,'cmd':'getActiveCodes','name':'Active codes','confirm':'Request active codes?'},
    {'id':4,'cmd':'cfgCHG','option1':'app','option2':'openByCode','option3':'gate',
      'name':'Code open Gate','confirm':'Open gate with code?'},
    {'id':5,'cmd':'cfgCHG','option1':'app','option2':'openByCode','option3':'magnet',
      'name':'Code open Magnet','confirm':'Open magnet with code?'},
    {'id':6,'cmd':'cfgCHG','option1':'keypad_matrix','option2':'default','option3':'flex',
      'name':'Set Keypad flex','confirm':'Set keypad flex?'},
    {'id':7,'cmd':'cfgCHG','option1':'keypad_matrix','option2':'default','option3':'hardPlastic',
      'name':'Set Keypad hard plastic','confirm':'Set keypad hardPlastic?'},
    {'id':8,'cmd':'cfgCHG','option1':'app','option2':'debugging','option3':'true',
      'name':'Set debug mode','confirm':'Set debug On?'},
    {'id':9,'cmd':'cfgCHG','option1':'app','option2':'debugging','option3':'false',
      'name':'Remove debug mode','confirm':'Set debug Off?'},
    {'id':10,'cmd':'cfgCHG','input':true,'option1':'app','option2':'settingsCode',
      'name':'Change settings Code','confirm':'Change settingsCode ?'},
    {'id':11,'cmd':'cfgCHG','input':true,'option1':'app','option2':'pwdRST',
      'name':'Change pwdRST','confirm':'Change pwdRST ?'},
            ]

  public SourcePage:string = 'admin';
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
  public routine_byh16s:string;
  input: boolean = false;
  backstageList:any;
  RoleList:any;

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
    this.getCores();
    if(!localStorage.getItem('roles')){
      this.getRoles();
    }
    
  }

  async getCores(){
    await this.api.getData('api/cores/admin/'  + this.userId).subscribe(async result =>{
      this.CoresList = await result;
      this.CoresList[0].open = true;
    },error => {
      console.log('Error response --> ', JSON.stringify(error))
    });
  }

  async getRoles(){
    this.api.getData('api/roles/' + localStorage.getItem('my-userId'))
      .subscribe(async (result: any) => {
        this.RoleList = await result;
        localStorage.setItem('roles',JSON.stringify(result));
      }, (error:any) => {
        console.log('Error response --> ', JSON.stringify(error));
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

  async addNewUser(CoreId:string,CoreName:string, pathLocation:string){
    const modal = await this.modalController.create({
      component: UpdUsersPage,
      componentProps:{
        'SourcePage': 'adminNew',
        'CoreName': CoreName,
        'CoreId': CoreId,
        'pathLocation': pathLocation
       }
    });
    
     await modal.present();
  
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

  async modalBackstage(){
    const modal = await this.modalController.create({
      component : BackstagePage
    });
    return await modal.present()
  }

  async routineSelected(event:any,item:any){
    if(this.routineOptions[event.detail.value]['input']){
      this.input = true;
      console.log('si agregue el input, item: ', item)
    }else{
      this.input = false;
      console.log('No agregue el input, item: ', item)
    }

    if(this.routineOptions[event.detail.value]['option1']){
      item['option1'] = this.routineOptions[event.detail.value]['option1'];
    }

    if(this.routineOptions[event.detail.value]['option2']){
      item['option2'] = this.routineOptions[event.detail.value]['option2'];
    }

    if(this.routineOptions[event.detail.value]['option3']){
      item['option3'] = this.routineOptions[event.detail.value]['option3'];
    }

    this.alertCtrlEvent(event, item,'Confirm', 
      this.routineOptions[event.detail.value]['confirm'],
      this.routineOptions[event.detail.value]['cmd'], 'Yes', 'Cancel');
  }

  
  async simChange(event:any,item:any){
   this.alertCtrlEvent(event,item,'Confirm','New sim: '+ this.sim + 
    ' ?', 'simChange', 'Yes','Cancel');
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

  async collectBackstage(id:string,name:string){
    console.log(`Id ${id}, name: ${name}`)
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

    let inputs = [{}];

    if(this.input){
      inputs.push({
        name: 'inputValue',
        placeholder: item.option2,
        type:'text'
      })
    }else{
      inputs = [];
    }

    let alert = await this.alertCtrl.create({
      header: titleMsg,
      message: Message,
      inputs : inputs,
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
                  if(await this.toolService.verifyNetStatus()){
                    await this.api.postData('api/cores/enable/' + 
                      this.userId,{'coreId' : item._id}).then(async (onResolve) =>{
                      await this.getCores();
                    },
                    (onReject) =>{
                      this.toolService.toastAlert('Can not enable core, error: <br>' + 
                        JSON.stringify(onReject),0,['Ok'],'bottom');
                    });
                  }else{
                    this.toolService.toastAlert('No hay Acceso a internet',0,['Ok'],'middle');
                  }
                }else{
                    if(await this.toolService.verifyNetStatus()){
                      await this.api.postData('api/cores/disable/' + 
                      this.userId,{'coreId' : item._id}).then(async (onResolve) =>{
                    await this.getCores();
                    },
                    (onReject) =>{
                      this.toolService.toastAlert('Cannot disable core, error: <br>' + 
                        JSON.stringify(onReject),0,['Ok'],'bottom');
                    });
                  }else{
                    this.toolService.toastAlert('No hay Acceso a internet',0,['Ok'],'middle');
                  }
                }
              break;
              case 'simChange':
                try{
                  if (this.sim.length >= 10 ){
                    if(await this.toolService.verifyNetStatus()){
                      console.log('item.Sim: ' + item.Sim)
                      await this.api.postData('api/cores/chgSim/' + this.userId ,
                        {'coreId':item._id, 'newSim':this.sim}).then(async (result) => {
                        // Change sim on pcb
                        await this.sms.send(item.Sim,'cfgCHG,sim,value,' + this.sim, options);
                        this.sim = '';
                        this.getCores();
                        this.simSectionOpen = false;
                        this.toolService.toastAlert('Sim cambiado ' + this.sim,0, ['Ok'], 'bottom')
                      }, error => {
                        this.toolService.toastAlert('chgSim API error: <br>' +
                        JSON.stringify(error),0,['Ok'],'bottom');
                      });
                    }else{
                      this.toolService.toastAlert('No hay Acceso a internet',0,['Ok'],'middle');
                    }
                  }else{
                    this.toolService.toastAlert('Formato Invalido',0, ['Ok'], 'bottom')
                  }
      
                }catch(e){
                  this.toolService.toastAlert('Sim no cambiado, error:<br>' 
                    + JSON.stringify(e),0, ['Ok'], 'bottom');
                }
                break;
              case 'getSIMstatus':
                try{
                  await this.sms.send(item.Sim,'status,gral',options);
                  this.toolService.toastAlert('Msg. enviado a ' + this.core_sim,0, ['Ok'], 'bottom');
                }catch(e){
                  this.toolService.toastAlert('No se envio, error: <br>' + JSON.stringify(e),0, ['Ok'], 'bottom');
                }
                break;
              case 'RestraintStatus':
                  try{
                    await this.sms.send(item.Sim,'status,restraint',options);
                    this.toolService.toastAlert('Msg. enviado a ' + this.core_sim,0, ['Ok'], 'bottom');
                  }catch(e){
                    this.toolService.toastAlert('No se envio, error: <br>' + JSON.stringify(e),0, ['Ok'], 'bottom');
                  }
                  break;

              case 'ModuleRST':
                try{
                    await this.sms.send(item.Sim,'rst,sim',options);
                    this.toolService.toastAlert('Msg. enviado a ' + item.Sim,0, ['Ok'], 'bottom');
                }catch(e){
                  this.toolService.toastAlert('No enviado, error:<br>' + JSON.stringify(e),0, ['Ok'], 'bottom');
                }
                break;
              case 'getActiveCodes':
                try{
                  await this.sms.send(item.Sim,'active_codes,sim',options);
                  this.toolService.toastAlert('Msg. enviado a ' + item.Sim,0, ['Ok'], 'bottom');
                }
                catch(e){
                  this.toolService.toastAlert('Msg. no enviado, error:<br>' + JSON.stringify(e),0, ['Ok'], 'bottom');
                  }
                break;
              case 'setOpen':
                try{
                  await this.sms.send(item.Sim,'setOpenCode,' + item.option1, options);
                  this.toolService.toastAlert('Msg. enviado a ' + item.Sim,0, ['Ok'], 'bottom');
                }
                catch(e){
                  this.toolService.toastAlert('No enviado, error:<br>' + 
                    JSON.stringify(e),0, ['Ok'], 'bottom');
                  }
                break;
              case 'setKeypad':
                try{
                  await this.sms.send(item.Sim,'setKeypad,' + item.option1, options);
                  this.toolService.toastAlert('Msg. enviado a ' + item.Sim,0, ['Ok'], 'bottom');  
                }
                catch(e){
                    this.toolService.toastAlert('No enviado, error:<br>' + JSON.stringify(e),0, ['Ok'], 'bottom');
                  }
                break;
              case 'cfgCHG':
                try{
                  if(this.input){
                    await this.sms.send(item.Sim,'cfgCHG,' + item.option1 + ',' + item.option2
                      + ',' + data.inputValue, options);
                  }else{
                      await this.sms.send(item.Sim,'cfgCHG,' + item.option1 + ',' + item.option2
                      + ',' + item.option3, options);
                  }
                  
                  this.toolService.toastAlert('Msg. enviado a ' + item.Sim,0, ['Ok'], 'bottom');  
                }
                catch(e){
                    this.toolService.toastAlert('No enviado, error:<br>' + JSON.stringify(e),0, ['Ok'], 'bottom');
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
