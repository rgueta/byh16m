import { Component, Input, OnInit } from '@angular/core';
import { ToastController, ModalController, 
  AnimationController,AlertController } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { Storage } from "@capacitor/core";


@Component({
  selector: 'app-upd-users',
  templateUrl: './upd-users.page.html',
  styleUrls: ['./upd-users.page.scss'],
})
export class UpdUsersPage implements OnInit {
  @Input() CoreId:string;
  @Input() Core:string;
  myToast:any;
  public UserList:any;
  userId : any;
  automaticClose = false;
  sim:any;
  deviceUUID:any;
  twilio:any;

  constructor(private modalController:ModalController,
              private toast:ToastController,
              private animationController:AnimationController,
              public api : DatabaseService,
              private sms: SMS,
              public alertCtrl:AlertController) { }

  async ngOnInit() {
    this.sim = await Storage.get({key:'my-core-sim'});
    this.userId = await Storage.get({key:'my-userId'});
    this.deviceUUID = await Storage.get({key:'device-uuid'});
    this.twilio = await Storage.get({key:'twilio'});


    console.log('collect user from private: ' + this.CoreId);
    this.collectUser();
  }

  async collectUser(){

    this.api.getData('api/users/user/core/' + this.CoreId).subscribe(async result =>{
      // console.table(result);
  
      this.UserList = await result;
      this.UserList[0].open = true;
      console.table(this.UserList); 
         });
  }

  async lockedUser(event,locked,UserId,name,email,uuid,sim,house){
    let msg = name + ',' + email + ',' + uuid + ',' + house;
    let element = <HTMLInputElement> document.getElementById("LockedToggle"); 

    if(event.target.checked != locked){
      let alert = await this.alertCtrl.create({
        header: 'Confirm',
        message: 'Proceed to lock user ?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'icon-color',
            handler: () => {
              element.checked = locked
            }
          },
          {
            text: 'Yes',
            cssClass: 'icon-color',
            handler: async data => {
              try{
  
              if(event.target.checked){
                msg = 'locked,' + msg
                if(this.twilio.value == 'false'){
                  await this.api.postData('api/users/locked/',{'userId': UserId}).then(
                      (onResolve) => {
                        // ------- send SMS  ---------------------
                        this.sendSMS(msg);
                        console.log('API Result  --> ', onResolve);
                  },
                  (onReject) =>{
                    console.log('API Rejected ', onReject)
                  }
                  );
                  
                }else{
                  this.api.postData('api/twilio/access/' + 
                  UserId + '/' + msg + '/' + this.sim['value'],'')
                }
              }else{
                msg = 'unlocked,'  + msg;
                if(this.twilio.value == 'false'){
                  await this.api.postData('api/users/unlocked/',{'userId':UserId}).then(
                    (onResolve) => {
                      // ------- send SMS  ---------------------
                      this.sendSMS(msg);
                      console.log('API Result  --> ', onResolve);
                  },
                  (onReject) =>{
                    console.log('API Rejected ', onReject)
                  });
                }else{

                  this.api.postData('api/twilio/access/' + 
                  UserId + '/' + msg + '/' + this.sim['value'],'')

                }
              }

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
  }

    // Send a text message using default options
    async sendSMS(msg){
      if(msg == ''){
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
    
 
      try{
        if(this.twilio['value'] == 'false'){
          await this.sms.send(this.sim,msg,options);
        }else{
          this.api.postData('api/twilio/open/' + this.userId['value'] + '/' + msg + '/' + this.sim,'')
        }
        
          const toast = await this.toast.create({
            message : 'Text was sent to ' + this.sim['value'],
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

  toggleSection(index){
    this.UserList[index].open = !this.UserList[index].open;
    if(this.automaticClose && this.UserList[index].open){
      this.UserList
      .filter((item, itemIndex) => itemIndex != index)
      .map(item => item.open = false);
    }
  }

  closeModal(){
    this.modalController.dismiss();
  }

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
