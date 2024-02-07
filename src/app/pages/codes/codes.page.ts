import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { ModalController,
         AnimationController } from '@ionic/angular';
import { UpdCodesModalPage } from '../../modals/upd-codes-modal/upd-codes-modal.page';
import { Utils } from '../../tools/tools';
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { environment } from 'src/environments/environment';
import { ToolsService } from "../../services/tools.service";

@Component({
  selector: 'app-codes',
  templateUrl: './codes.page.html',
  styleUrls: ['./codes.page.scss'],
})
export class CodesPage implements OnInit {

  CodeList:any;
  myToast:any;
  userId = {};
  automaticClose = false;
  codeEnabled:any;

  initial: any;
  expiry : any;
  diff: any;
  myRoles:{};
  myToken:any;
  load_codes : true;

  constructor(public api : DatabaseService,
              public modalController: ModalController,
              public animationController : AnimationController,
              private sms: SMS,
              private toolsService:ToolsService
              ) { }

  async ngOnInit() {
    
    this.myToken = await localStorage.getItem('my-token');
    let uId = await localStorage.getItem('my-userId');
    this.userId = await uId;
    this.myRoles = await localStorage.getItem('my-roles');

    // console.log('ngOnInit at codes.page roles --> ', this.myRoles);
    this.collectCodes(); 
  }


  async collectCodes(){
    this.api.getData_key('api/codes/user/' + this.userId, 
      this.myToken).subscribe(async result =>{
      Object.entries(result).forEach(async ([key,item]) =>{
          if(new Date(item.expiry) < new Date()){
            item.expired = true;
          }else{
            item.expired = false;
          }

          item.range = await ((new Date(item.expiry).getTime() - 
            new Date().getTime() ) / 3600000).toFixed(1);
      });
      
      this.CodeList = await result;
      this.CodeList[0].open = true;
      this.initial = this.CodeList[0].initial;
      this.expiry = this.CodeList[0].expiry;
      });

      // await this.HrsRange();
  }

  async doRefresh(event:any){
    this.collectCodes();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  toggleSection(index:number){
    this.CodeList[index].open = !this.CodeList[index].open;
    if(this.automaticClose && this.CodeList[index].open){
      this.CodeList
      .filter((item:{}, itemIndex:number) => itemIndex != index)
      .map((item:any) => item.open = false);
    }
  }

  async sendCode(visitorId:string){
    var pkg : {};

    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }

    const sim =  await localStorage.getItem('my-core-sim');

    await Object.entries(this.CodeList).forEach(async (key,  item:any) =>{
      if(item['_id'] === visitorId){
        let pkg = item;
        pkg['initial'] = await Utils.convDate(this.initial);
        pkg['expiry'] = await Utils.convDate(this.expiry);
        pkg['enable'] = await  this.codeEnabled;
        delete pkg['expired'];
        delete pkg['open'];
        // delete pkg['visitorSim'];
        delete pkg['visitorName'];
        delete pkg['email'];

        try{
          if(await this.toolsService.verifyNetStatus()){
            await this.api.putData('api/codes/update/' +  
                            pkg['userId'] + '/' + pkg['_id'] ,pkg)
          }else{
            this.toolsService.toastAlert('No hay acceso a internet',0,['Ok'],'middle');
          }

        }catch(err){
            this.toolsService.showAlertBasic('Aviso','Ocurrio una excepcion',
            'Error: ' + err,['Ok'])
        }
      }
    });
    
   
    try{
        this.collectCodes(); 
        this.toolsService.toastAlert('Codigo enviado a '+ sim,0,['Ok'],'bottom');
    }
    catch(e:any){
      this.toolsService.showAlertBasic('Aviso','Ocurrio una excepcion',
      `Error: ` + e.message,['Ok']);
      }

  }

  async ResendCode(code:string,visitorId:string,Initial:any,Expiry:any){
    // var pkg : {};
    var pkg = {'code':'','_id':'','initial':'','expiry':''};

    console.log('Resend code --> ', 'codigo : ' + code + 
    ' ,Initial : ' + Initial + ' ,Expiry : ' + Expiry + 
    ', _id : ' + visitorId)


    return;

    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }
    // const sim =  await this.storage.get('my-core-sim');
    const sim =  await localStorage.getItem('my-core-sim');

    pkg['code'] = code;
    pkg['_id'] = visitorId;
    pkg['initial'] = Utils.convDate(Initial);
    pkg['expiry'] = Utils.convDate(Expiry);

    try{
      if(environment.app.debugging_send_sms){
        await this.sms.send(sim,'codigo,' + pkg['code'] +','+ pkg['expiry'] + ',' + pkg['_id']);

          this.collectCodes(); 
          this.toolsService.toastAlert('Texto fue enviado',0,['Ok'],'middle');
      }  
        
    }
    catch(e:any){
      this.toolsService.showAlertBasic('Aviso','Ocurrio una excepcion',
      'Error: ' + e,['Ok']);
      }

  }

  async onChangeExpiry(codeId:string,initial:any,expiry:any){
    if(new Date(expiry) <= this.initial){
      this.toolsService.showAlertBasic('','',
        'Tiempo final debe ser meyor al tiempo inicial',['Cerrar']);
      return;
    }else{
      this.expiry = new Date(expiry);
      this.diff = await (Math.abs(new Date().getTime() - this.expiry.getTime()) / 3600000).toFixed(1);
      if (this.diff > 0){

        var arrFound = this.CodeList.find((item:any,i:number) =>{
          if (item['_id'] == codeId){
            this.CodeList[i].changed = true;
          }
        })

        this.codeEnabled = true;
      }
    }
  }

  async onChangeInitial(initial:any,expiry:any){
    console.log('onChangeInitial -> ' + initial)
    if(new Date(initial) >= expiry){
      this.toolsService.showAlertBasic('','',
        'Tiempo inicial debe ser menor al tiempo final',['Cerrar']);
      return;
    }else{
      this.initial = new Date(initial);
      // this.diff =  await (Math.abs(this.initial.getTime() - this.expiry.getTime()) / 3600000).toFixed(1);
      console.log('Initial : ' + Utils.convDate(this.initial) + '\nExpiry :  ' + Utils.convDate(this.expiry) + '\nDiff hrs. ' + this.diff);
    }
  }

        // ---- Animation controller  ----------------------------------

  async addCode() {
    const modal = await this.modalController.create({
      component: UpdCodesModalPage,
    });
    return await modal.present();
  }

}
