import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController,NavParams } from "@ionic/angular";
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
  
  constructor(
    private modalController:ModalController,
    private alertCtrl:AlertController,
    private api:DatabaseService,
    private navParams:NavParams,
    private toolService:ToolsService,
    private sms: SMS,
  ) { }

  ngOnInit() {
    this.coreId = this.navParams.data['CoreId'];
    this.getUsers();
  }

  async getUsers(){
    await this.api.getData('api/users/core/' + this.coreId + '/' +
    localStorage.getItem('my-userId')
    ).subscribe(async (result:any) => {
      this.users = result;
      this.users[0].open = true;
      console.log('users --> ', result);
    });
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

  async chgLockStatus(event:any,userStatus:any, id:string, sim:string, 
      name:string, house:string,coreSim:string) {
    const adminId = localStorage.getItem('my-userId');
    const titleMsg = (userStatus ? 'Lock' : 'Unlock')
    const status = titleMsg.toLowerCase();
    const pkg = status + ',' + name + ',' + house + ',' + sim + ',' + id;
    // const pkg = status + ',' + name + ',' + house + ',6641752182,' + id;

    let alert = await this.alertCtrl.create({
      subHeader: 'Confirm',
      message: titleMsg + ' [ ' + name + ' ] ?',
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
            
            // const devSim = localStorage.getItem()
            await this.api.postData('api/users/' + status + '/' + adminId + '/' + id, 
            {'neighborId' : id}).then(async (onResolve) =>{
                await this.sms.send(coreSim,pkg ,options)
                .then()
                .catch((e:any) => this.toolService.showAlertBasic('Alerta','Error send sms',e,['Ok']));

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
