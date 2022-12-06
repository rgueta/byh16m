import { ThrowStmt } from '@angular/compiler';
import { Component, Input } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { ToastController, ModalController, AnimationController } from '@ionic/angular';
import { UpdCodesModalPage } from '../../modals/upd-codes-modal/upd-codes-modal.page';
import { $, utils } from 'protractor';
import { Utils } from '../../utils';
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { Storage } from "@capacitor/core";


@Component({
  selector: 'app-Codes',
  templateUrl: 'Codes.page.html',
  styleUrls: ['Codes.page.scss']
})
export class CodesPage {
  // public topi:any;
 
  public CodeList:any;
  myToast:any;
  userId = {};
  automaticClose = false;
  codeEnabled:any;

  initial: any;
  expiry : any;
  diff: any;
  myRoles:{};
  myToken:any;


  constructor(public api : DatabaseService,
              public toast:ToastController,
              public modalController: ModalController,
              public animationController : AnimationController,
              private sms: SMS) {
  
             
      }

  async ngOnInit(){
    // this.myToken = await this.storage.get('my-token');
    // this.userId = await this.storage.get('my-userId');
    // this.myRoles = await this.storage.get('my-roles');

    this.myToken = await Storage.get({key : 'my-token'});
    await Storage.get({key: 'my-userId'}).then(uId => {
      this.userId = uId.value;
    });
    await Storage.get({key : 'my-roles'}).then(roles => {
      this.myRoles = roles.value;
    });

    // console.log('ngOnInit at codes.page roles --> ', this.myRoles);
    this.collectCodes(); 
  }

  async doRefresh(event){
    this.collectCodes();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  toggleSection(index){
    this.CodeList[index].open = !this.CodeList[index].open;
    if(this.automaticClose && this.CodeList[index].open){
      this.CodeList
      .filter((item, itemIndex) => itemIndex != index)
      .map(item => item.open = false);
    }
  }

  toggleItem(index, childIndex){
    this.CodeList[index].children[childIndex].open = !this.CodeList[index].open;
  }

    push_notifications(_id:Number){
      this.toastEvent('Process code ' + _id);
      
    }

    async collectCodes(){
      console.log('userId to collect codes: ' + this.userId);
      this.api.getData_key('api/codes/user/' + this.userId, this.myToken).subscribe(result =>{
        Object.entries(result).forEach(async ([key,item]) =>{
            // console.log('Expiry --> ' + new Date(item.expiry)  + ' - Utils.convDateToday() --> ' + Utils.convDateToday());
            if(new Date(item.expiry) < new Date()){
              item.expired = true;
            }else{
              item.expired = false;
            }

            item.range = await ((new Date(item.expiry).getTime() - new Date().getTime() ) / 3600000).toFixed(1);
      });
        
              
        this.CodeList = result;
        this.CodeList[0].open = true;
        this.initial = new Date(this.CodeList[0].initial);
        this.expiry = new Date(this.CodeList[0].expiry);
        // console.table(result); 
           });

        // await this.HrsRange();
        console.table(this.CodeList);
    }

    async EnableCode($event,codeId,expiry){

      if((new Date(this.expiry) < new Date()) && $event.detail.checked ){
        // console.log('No se debe habilitar..');
        this.toastEvent('Codigo ya expiro ..')
        $event.detail.checked = false;
        this.codeEnabled = false;
      }else{
        this.codeEnabled = await ($event.detail.checked ? 1 : 0);
       
      }

      // console.log('change code : ' + codeId + ' to enable ->  ', $event.detail.checked);
    }

    async onChangeInitial($event){
      // console.log('onChangeInitial -> ' + $event)
      if(new Date($event) >= this.expiry){
        alert('Tiempo inicial debe ser menor al tiempo final');
        return;
      }else{
        this.initial = new Date($event);
        // this.diff =  await (Math.abs(this.initial.getTime() - this.expiry.getTime()) / 3600000).toFixed(1);
        console.log('Initial : ' + Utils.convDate(this.initial) + '\nExpiry :  ' + Utils.convDate(this.expiry) + '\nDiff hrs. ' + this.diff);
      }
    }

    async onChangeExpiry(codeId,initial,expiry){
      this.initial = new Date(initial);
      // console.log('initital: ' + initial + ', expiry: ' + expiry)
      if(new Date(expiry) <= this.initial){
        alert('Tiempo final debe ser meyor al tiempo inicial');
        return;
      }else{
        this.expiry = new Date(expiry);
        this.diff = await (Math.abs(new Date().getTime() - this.expiry.getTime()) / 3600000).toFixed(1);
        if (this.diff > 0){

          var arrFound = this.CodeList.find((item,i) =>{
            if (item['_id'] == codeId){
              
              console.log('Si te encontre -->', item['code'])
              console.log('Del CodeList -->', this.CodeList[i]['code'])
              this.CodeList[i].changed = true;
            }
          })

          this.codeEnabled = true;
        }
      console.log('Initial : ' + this.initial + '\nExpiry :  ' + this.expiry + '\nDiff hrs. ' + this.diff);
      }
    }


  async sendCode(visitorId){
    var pkg : {};

    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }
    // const sim =  await this.storage.get('my-core-sim');
    const sim =  await Storage.get({key : 'my-core-sim'});

    await Object.entries(this.CodeList).forEach(async ([key,item]) =>{
      if(item['_id'] === visitorId){
        pkg = item;
        pkg['initial'] = Utils.convDate(this.initial);
        pkg['expiry'] = Utils.convDate(this.expiry);
        pkg['enable'] = this.codeEnabled;
        delete pkg['expired'];
        delete pkg['open'];
        // delete pkg['visitorSim'];
        delete pkg['visitorName'];
        delete pkg['email'];

        try{
          await this.api.putData('api/codes/update/' +  
                          pkg['userId'] + '/' + pkg['_id'] ,pkg)

        }catch(err){
            console.error('Error api putData --> ' + err)
        }
      }
    });
    
   
    try{

      await this.sms.send(sim.value,'codigo,' + pkg['code'] +','+ pkg['expiry'] + ',' + pkg['_id']);
      // alert('Text was sent !')
        const toast = await this.toast.create({
          message : 'Text sent to ' + sim.value,
          duration: 4000
        });

        this.collectCodes(); 
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


  async ResendCode(code,visitorId,Initial,Expiry){
    // var pkg : {};
    var pkg : {'code':'','_id':'','initial':'','expiry':''};

    console.log('Resend code --> ', 'codigo : ' + code +' ,Initial : '+ Initial + ' ,Expiry : ' + Expiry + ', _id : ' + visitorId)


    return;
    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }
    // const sim =  await this.storage.get('my-core-sim');
    const sim =  await Storage.get({key : 'my-core-sim'});

    pkg['code'] = code;
    pkg['_id'] = visitorId;
    pkg['initial'] = Utils.convDate(Initial);
    pkg['expiry'] = Utils.convDate(Expiry);


    console.log('Resend code --> ', 'codigo,' + pkg['code'] +','+ pkg['expiry'] + ',' + pkg['_id'])

    

    try{

      await this.sms.send(sim.value,'codigo,' + pkg['code'] +','+ pkg['expiry'] + ',' + pkg['_id']);
      // alert('Text was sent !')
        const toast = await this.toast.create({
          message : 'Text was sent !',
          duration: 4000
        });

        this.collectCodes(); 
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


      // ---- Animation controller  ----------------------------------

      async addCode() {
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
          component: UpdCodesModalPage,
          enterAnimation,
          leaveAnimation,
          // cssClass: "my-modal"
        });
        return await modal.present();
      }

}
