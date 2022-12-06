import { Component, Input, OnInit,NgModule  } from '@angular/core';
import { ModalController,AlertController, Platform, ToastController } from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { Utils } from '../../utils';
// import { element } from 'protractor';
import { Sim } from "@ionic-native/sim/ngx";
import { SMS, SmsOptions } from "@ionic-native/sms/ngx";
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";
import { Storage } from "@capacitor/core";
import { timeoutWith } from 'rxjs/operators';
import { Router } from '@angular/router';

const USERID = 'my-userId';

@Component({
  selector: 'app-upd-codes-modal',
  templateUrl: './upd-codes-modal.page.html',
  styleUrls: ['./upd-codes-modal.page.scss'],
})
export class UpdCodesModalPage implements OnInit {
  @Input() code:string;
  @Input() visitorSim:String;
  @Input() range:Number;
  @Input() localComment:string;
  public myVisitors:{};
  // public UpdCodeForm: FormGroup;
  
  selectdVisitor:any;
  initial: any;
  expiry : any;
  diff: any;
  userId = {};
  StrPlatform = '';
  // comment = '';
  visitorId='';

  // -- Validators  ------------

  UpdCodeForm =  this.formBuilder.group({
    visitor: ['',Validators.required],
    visitorSim: new FormControl(['',Validators.required])

  });

  get visitor(){
    return this.UpdCodeForm.get('visitor');
  }

  public get sim(){
    return this.UpdCodeForm.get('sim');
  }
  
  constructor(public modalController : ModalController,
              public api : DatabaseService,
              public platform : Platform,
              public libSim : Sim,
              public formBuilder: FormBuilder,
              public sms:SMS,
              public toast:ToastController,
              private alertController: AlertController,
              private router: Router, ) { }


  async ngOnInit() {
    // this.userId = await this.storage.get('my-userId')
    // this.userId = await Storage.get({key :USERID});
     await Storage.get({key : 'my-userId'}).then(val_userId => {
      this.userId = val_userId.value;
    });

    console.log('Soy el usuario : ' + this.userId);
    this.code = this.genCode().toString();
    this.getVisitors();
    this.initDates();
    this.getPlatform();

  

    this.libSim.hasReadPermission().then(
      (info) => console.log('Has permission: ', info)
    );
    
    this.libSim.requestReadPermission().then(
      () => console.log('Permission granted'),
      () => console.log('Permission denied')
    );

    this.libSim.getSimInfo().then(
      (info) => console.log('Sim info: ' , info ),
      (err) => console.log('Unable to get sim info: ', err)
    );

    // console.log(JSON.stringify(this.newData));

    // this.UpdCodeForm = new FormGroup({
    //   visitor: new FormControl('',[Validators.required]),
    //   sim: new FormControl('',[Validators.required])

    // });
    // this.UpdCodeForm =  await this.formBuilder.group({
    //   visitor: ['',Validators.required],
    //   sim: ['',Validators.required]

    // });
  }

getPlatform(){
  console.log('Platform : ' + this.platform.platforms);
  if (this.platform.is('android')){
    this.StrPlatform = 'android';
  }
  else if(this.platform.is('ios')){
    this.StrPlatform = 'ios';
  }else if(this.platform.is('desktop')){
    this.StrPlatform = 'desktop';
  }else if(this.platform.is('mobile')){
    this.StrPlatform = 'mobile';
  }else{
    this.StrPlatform = 'other';
  }
}


  async initDates(){
    this.initial = new Date();
    this.expiry = new Date(new Date().setHours(new Date().getHours() + 4));
    this.diff =  await (Math.abs(this.initial.getTime() - this.expiry.getTime()) / 3600000).toFixed(1);
  }



  async onChangeInitial($event){
    if(new Date($event) >= this.expiry){
      alert('Tiempo inicial debe ser menor al tiempo final');
      this.initDates();
      return;
    }else{
      this.initial = new Date($event);
      this.diff =  await (Math.abs(this.initial.getTime() - this.expiry.getTime()) / 3600000).toFixed(1);
      console.log('Initial : ' + Utils.convDate(this.initial) + '\nExpiry :  ' + Utils.convDate(this.expiry) + '\nDiff hrs. ' + this.diff);
    }

  }

  async onChangeExpiry($event){
    if(new Date($event) <= this.initial){
      alert('Tiempo final debe ser meyor al tiempo inicial');
      this.initDates();
      return;
    }else{
      this.expiry = new Date($event);
      this.diff = await (Math.abs(this.initial.getTime() - this.expiry.getTime()) / 3600000).toFixed(1);
    console.log('Initial : ' + this.initial + '\nExpiry :  ' + this.expiry + '\nDiff hrs. ' + this.diff);
    }
  }

  async getVisitors(){
    let initDate : any;
    let finalDate : any;
    console.log('get visitor for : -> ' + this.userId);
    // this.userId = '60afc4125d8280dc19460980';
    await this.api.getData('api/visitors/user/'+ this.userId).subscribe(visitors =>{
      
      this.myVisitors = visitors;
      console.table(visitors);
      // console.log('in upd-codes-modal getData..' + JSON.stringify(this.newData));
  });


}

  newCode(){
    // console.log('generate ne code..!');
    this.code = this.genCode().toString();
    // alert(this.genCode())[0];
    // this.genCode();
  }

   genCode(){
    var result           = [];
    var characters       = '0123456789ABCD';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
       result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));

   }
   return result.join('');
  }

  async onChangeComment($event){
    console.log('comment -> ' + $event);
    this.localComment = $event;
  }


  async onSubmitTemplate(){
    var dateInit = '';
    var dateFinal = '';
    // const sim =  await this.storage.get('my-core-sim')
    const coreSim =  await Storage.get({key : 'my-core-sim'})
    const userSim =  await Storage.get({key : 'my-sim'})
    const coreName = await Storage.get({key : 'core-name'})
    const expire = await ((new Date(this.expiry).getTime() - new Date().getTime() ) / 3600000).toFixed(1)

    try{

      this.api.postData('api/codes/' + this.userId,{'code':this.code,'sim':this.visitorSim,
       'initial': Utils.convDate(this.initial),
       'expiry' : Utils.convDate(this.expiry),'visitorId' : this.visitorId ,'comment': this.localComment,
       'source': {'user' : this.userId,'platform' : this.StrPlatform, 'id' : userSim.value}}).then(async resp => {
        
//------- Uncomment, just to fix bug 
        const respId = Object.values(resp)[1];
        
         // Send code to core
        const pckgToCore = 'codigo,' + this.code +','+ Utils.convDate(this.expiry) 
        + ',' + this.userId + ',' + this.visitorSim + ',' + respId
        
      await this.sendSMS(coreSim['value'], pckgToCore);

       // send code to visitor
       await this.sendSMS(this.visitorSim,'codigo ' + coreName['value'] + ': ' + this.code + 
       '  Expira en ' + expire + ' Hrs.' )
 
      //  this.showAlerts('Message', 'Se envio el codigo')

       },error =>{
        console.log('apiReturned  Error -->', error);
       });

    }catch(err){
        console.log('Can not post data : ', err);
    }
    
    // this.api.sendPostRequest('api/newCode',{'code':this.code,'sim':this.sim,'range':this.range});
  }


  async sendSMS(sim,text){
    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }

    const use_twilio =  await Storage.get({key:'twilio'});

    try{

      if(use_twilio.value == 'false'){
        console.log('sim --> ',sim);
        console.log('text --> ',text);
        await this.sms.send(sim,text);
      }else{
        console.log('url -- >   api/twilio/' + this.userId + '/' + text + '/' + sim['value']);
        this.api.postData('api/twilio/open/' + this.userId + '/' + text + '/' + sim['value'],'')
      }

        // this.showAlerts('Message', 'Se envio el codigo')

        // const toast = await this.toast.create({
        //   message : 'Text was sent !',
        //   duration: 4000
        // });

        //   toast.present();
        
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
  
  // async setupCode(visitorId,visistorSim){
    async setupCode(){
      this.visitorSim = this.selectdVisitor.sim;
      this.visitorId = this.selectdVisitor._id;
    //  Object.entries(this.myVisitors).forEach(async ([key,item]) =>{
    //    Object.keys(item).forEach(async (key) => {
    //     console.log('setupCode visitorSim --> ',item['sim'])
    //      if(item['_id'] === item['_id'] && key === 'sim'){
    //        this.visitorId = await item[key];
    //        console.log('setupCode visitorSim --> ',item[key])
    //      }
        
    //    })
    //   });
    
  } 

   // -------   show alerts              ---------------------------------
   async showAlerts(header,message){
    const MsgAlert = await this.alertController.create({
      cssClass : "basic-alert",
      header: header,
      message: message,
      buttons: [
        { text : 'OK',
        handler : () => {
          this.closeModal();
          // const url = '/codes'
          // this.router.navigateByUrl(url, {replaceUrl: true});
          // this.router.navigate([url] , { state : { from : 'login'}  }); //send parameters
        }
        
      }
      ],
    });
    await MsgAlert.present();
  }

  closeModal(){
    this.modalController.dismiss();
  } 

}
