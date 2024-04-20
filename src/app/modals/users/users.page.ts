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

  ngOnInit() {
    this.coreId = this.navParams.data['CoreId'];
   
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
    const status = titleMsg.toLowerCase();
    const pkg = status + ',' + name + ',' + house + ',' + sim + ',' + id;

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
