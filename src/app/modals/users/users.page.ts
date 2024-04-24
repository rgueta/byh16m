import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController,NavParams, NavController } from "@ionic/angular";
import { DatabaseService  } from "../../services/database.service";
import { ToolsService } from "../../services/tools.service";
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  users : any;
  automaticClose = false;
  coreId: string = '';
  coreName : string= '';
  RoleList : any = [];
  editRole : boolean = false;
  soyAdmin : boolean = false;
  editSim : boolean = false;
  sim:string;
  public simSectionOpen = false;
  userId : string = '';
  
  constructor(
    private modalController:ModalController,
    private alertCtrl:AlertController,
    private api:DatabaseService,
    private navParams:NavParams,
    private toolService:ToolsService,
    private sms: SMS,
    public navCtrl : NavController
  ) { }

  async ionViewWillEnter(){
    this.coreId = this.navParams.data['CoreId'];
    this.soyAdmin = localStorage.getItem('my-role') == 'admin' ? true : false;
    this.getUsers();
    this.getRoles();
  }

  async ngOnInit() {
    this.coreId = this.navParams.data['CoreId'];
    this.userId = await localStorage.getItem('my-userId');
   
  }

  async getRoles(){
    this.api.getData('api/roles/' + localStorage.getItem('my-userId'))
      .subscribe(async (result: any) => {
        this.RoleList = await result;
      },
      (error:any) => {
        this.toolService.showAlertBasic('Alerta','Error, getRoles: ',
                  JSON.stringify(error),['Ok']);
      });
  }

  async getUsers(){
    await this.api.getData('api/users/core/' + this.coreId + '/' +
    localStorage.getItem('my-userId')
    ).subscribe(async (result:any) => {
      this.users = result;
      this.users[0].open = true;
    });
  }

  onEditSim(){
    this.editSim = !this.editSim;
  }
  

  async simChange(neighborId:string,actualSim:string){

    const coreSim = localStorage.getItem('my-core-sim')
    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    } 

      // >> Confirmation ------------------------------------

    let alert = await this.alertCtrl.create({
      subHeader: 'Mandar solicitud',
      message: 'Cambiar numero de cell ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: (

          ) => {
          }
        },
        {
          text: 'Si',
          handler: async () => {
            try{
              if (this.sim.length >= 10 ){
                if(await this.toolService.verifyNetStatus()){
                  await this.api.postData('api/users/updSim/' + this.userId ,
                    {'userId':neighborId, 'newSim':this.sim})
                    .then(async (result) => {
                      // Change sim on pcb
                      await this.sms.send(coreSim,'updSim,' + actualSim + ',' + this.sim, options)
                      .then(() =>{
                        this.sim = '';
                        this.getUsers();
                        this.simSectionOpen = false;
                        this.toolService.showAlertBasic('','Sim cambiado','',['Ok']);
                      })
                      .catch((err) =>{
                        this.toolService.showAlertBasic('','No se envio sms, error: <br>',
                      JSON.stringify(err),['Ok']);
                      })
                      
                  })
                    .catch((err) => {
                      this.toolService.showAlertBasic('','updSim API error: <br>',
                      JSON.stringify(err),['Ok']);

                    });
        
                }else{
                  this.toolService.showAlertBasic('','No hay Acceso a internet','',['Ok']);
                }
              }else{
                this.toolService.showAlertBasic('','Formato Invalido','',['Ok']);
              }
        
            }catch(e){
              this.toolService.showAlertBasic('','Error, updSim: ',
                  JSON.stringify(e),['Ok']);
            }
          }
        }
      ]
    });

    return await alert.present();

    // << Confirmation  -----------------------------------


  }
 
  // region sim Section Routine -------------------------------
  toggleSectionSim(){
    this.simSectionOpen = !this.simSectionOpen
  }

  onEditRole(){
    this.editRole = !this.editRole;
  }


  async doRefresh(event:any){
    this.getUsers();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  toggleSection(index:number){
    this.users[index].open = !this.users[index].open;
    if(this.automaticClose && this.users[index].open){
      this.users
      .filter((item:{}, itemIndex:number) => itemIndex != index)
      .map((item:any) => item.open = false);
    }
  }

  async changeRoles(event:any, userId:string, name:string){
    console.log(event.detail.value)
    const userAdminId = localStorage.getItem('my-userId');
    const pkg = {'userId':userId, 'roles': event.detail.value}


    let alert = await this.alertCtrl.create({
      subHeader: 'Cambiar roles ',
      message:  'al usuario: ' + name + '  ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Ok',
          handler: async data => {
            
            await this.api.postData('api/users/updroles/' + userAdminId ,
            pkg)
            .then(async (res) =>{
                await this.getUsers();

            })
            .catch((rej) =>{
              this.toolService.showAlertBasic('Alert','Error api call', 
              'Can not update roles, error ' + JSON.stringify(rej), ['Ok']);
            });
              
          }
        }
      ]
    });

    await alert.present();

  }

  async chgLockStatus(event:any,userStatus:any, id:string, sim:string, 
      name:string, house:string,coreSim:string) {
    const adminId = localStorage.getItem('my-userId');
    const titleMsg = (userStatus ?  'Desbloqueo' : 'Bloqueo')
    const status = (userStatus ?  'unlock' : 'lock')
    const pkg = status + ',' + name + ',' + house + ',' + sim + ',' + id ;

    let alert = await this.alertCtrl.create({
      subHeader: 'Continuar con ' + titleMsg,
      message:  'al usuario: ' + name + '  ?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            event.target.checked = !event.target.checked;
          }
        },
        {
          text: 'Ok',
          handler: async data => {
            const options:SmsOptions={
              replaceLineBreaks:false,
              android:{
                intent:''
              }
            }
            
            await this.api.postData('api/users/' + status + '/' + adminId + '/' + id, 
            {'neighborId' : id}).then(async (onResolve) =>{
              // set lock status on device 
              await this.sms.send(coreSim,pkg ,options)
              .then()
              .catch((e:any) => this.toolService.showAlertBasic('Alerta','Error send sms'
                ,e,['Ok']));

              await this.getUsers();

            },
            (onReject) =>{
              this.toolService.showAlertBasic('Alert','Error api call', 
              'Can not ' + status + ' user, ' + onReject, ['Ok']);
            });
              
          }
        }
      ]
    });

    await alert.present();
  }

  removeVisitor(index:number,item:any){

  }

  closeModal(){
    this.modalController.dismiss();
  } 

}
