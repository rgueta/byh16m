import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalController,AlertController,LoadingController,
  Platform, ToastController, IonSelect, 
  IonLoading} from '@ionic/angular';
import { DatabaseService } from '../../services/database.service';
import { Utils } from '../../tools/tools';
import { Sim } from "@ionic-native/sim/ngx";
import { SMS, SmsOptions } from "@ionic-native/sms/ngx";
import { Validators, FormGroup, FormControl} from "@angular/forms";
import { VisitorListPage } from '../visitor-list/visitor-list.page';
import { ToolsService } from "../../services/tools.service";
import html2canvas from "html2canvas";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from "@capacitor/share";

const USERID = 'my-userId';

@Component({
  selector: 'app-upd-codes-modal',
  templateUrl: './upd-codes-modal.page.html',
  styleUrls: ['./upd-codes-modal.page.scss'],
  encapsulation:ViewEncapsulation.None,
})
export class UpdCodesModalPage implements OnInit {
  RegisterForm : FormGroup;
  @Input() code:string;
  @Input() visitorSim:string = '';
  @Input() visitorCode:string = '';
  @Input() range:Number;
  @Input() localComment:string;

  @ViewChild('VisitorList') visitorSelectRef: IonSelect;

  myVisitors:any;
  selectedVisitor:any;
  initial: any = new Date().toISOString();
  expiry : any = new Date().toISOString();
  diff: any;
  expiry_hrs : 0;
  userId = {};
  StrPlatform = '';
  comment = '';
  Localtoast: any;
  codeCreated: boolean = false;  //to return callback for resfresh or not

  public code_expiry:any;


  constructor(
    public modalController : ModalController,
    public api : DatabaseService,
    public platform : Platform,
    public libSim : Sim,
    public sms:SMS,
    public toast:ToastController,
    private alertController: AlertController,
    private loadingController : LoadingController,
    private toolService:ToolsService,
    ) {
      this.validateControls();
    }

  async validateControls(){

     this.RegisterForm = new FormGroup({
      ValidVisitorName : new FormControl('', [Validators.required]),
      ValidVisitorSim : new FormControl('', [Validators.required]),
    });
  }

  async ngOnInit() {
    this.userId = await localStorage.getItem('my-userId');

    this.code_expiry = Number(await localStorage.getItem('code_expiry'));

    this.code = this.genCode(7);
    this.getVisitors();
    this.initDates();
    this.getPlatform();

    this.libSim.hasReadPermission().then(
      (info:any) => console.log('Has permission: ', info)
    );

    this.libSim.requestReadPermission().then(
      () => console.log('Permission granted'),
      () => console.log('Permission denied')
    );

    this.libSim.getSimInfo().then(
      (info:any) => console.log('Sim info: ' , info ),
      (err:any) => console.log('Unable to get sim info: ', err)
    );

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
    this.expiry = new Date(new Date().setHours(new Date().getHours() + this.code_expiry));
    this.diff =  await (Math.abs(this.initial.getTime() - this.expiry.getTime()) / 3600000).toFixed(1);

    this.initial = await new Date().toISOString();
    this.expiry =  await new Date(new Date().setHours(new Date().getHours() + this.code_expiry)).toISOString();
  
  }

  async onRangeChange(event:any){
    var expiry = new Date();
    this.diff = event.detail.value;

    this.expiry = expiry.setHours(expiry.getHours() + Number(event.detail.value));

    console.log(`Initial: ${new Date(this.initial)} - Expiry: ${new Date(this.expiry)} `);
  }

  async getVisitors(){
    this.myVisitors = await JSON.parse(localStorage.getItem('visitors'))

    //Sort Visitors by name
    this.myVisitors = await Utils.sortJsonVisitors(this.myVisitors,'name',true);

}

async setupCode(event:any){
  this.visitorSim = this.selectedVisitor.sim;
  this.visitorSelectRef.disabled;
}

  async updSelectedVisitor(item:any){
    for(var i = 0; i < this.myVisitors.length; i++ ){
      if(item.name === this.myVisitors[i].name &&
         item.sim === this.myVisitors[i].sim){
        this.myVisitors[i].date = new Date();
        break;
      }
    }

    localStorage.setItem('visitors',JSON.stringify(this.myVisitors));
  }

  newCode(){
    this.code = this.genCode(7);
  }

  genCode(len:number){
    var result           = [];
    var characters       = '0123456789ABCD';
    var charactersLength = characters.length;
    for ( var i = 0; i < len; i++ ) {
       result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));

   }
   return result.join('');
  }

  async onChangeComment($event:any){
    this.localComment = $event;
  }

  async onSubmitTemplate(SendVisitor:boolean){
    var dateInit = '';
    var dateFinal = '';
    this.codeCreated = await true;
    
    const coreSim =  await localStorage.getItem('my-core-sim')
    const userSim =  await localStorage.getItem('my-sim')
    const coreName = await localStorage.getItem('core-name')
    const expire = await ((new Date(this.expiry).getTime() - 
      new Date().getTime() ) / 3600000).toFixed(1)

    this.updSelectedVisitor(this.selectedVisitor);
    
    this.loadingController.create({
      message: ' Mandando codigo ...',
      translucent: true
    }).then(async (res:any) => {
      res.present();

        try{

          this.api.postData('api/codes/' + this.userId,{'code':this.code,
          'sim':this.visitorSim,
          'initial': Utils.convDate(new Date(this.initial)),
          'expiry' : Utils.convDate(new Date(this.expiry)),
          'visitorSim' : this.visitorSim,'visitorName' : this.selectedVisitor.name,
          'comment': this.localComment,
          'source': {'user' : this.userId,'platform' : this.StrPlatform,
          'id' : userSim}})
          .then(async resp => {
    //------- Uncomment, just to fix bug

            const respId = await Object.values(resp)[1];

          // #region Send code to Core  ----------------------  

          const pckgToCore = await 'codigo,' + this.code +','+ 
          Utils.convDate(new Date(this.expiry)) + ',' + 
          this.userId + ',' + this.visitorSim + ',' + respId
        
          // Check if core has sim to send sms
          if (coreSim){

            await this.sendSMS(coreSim, pckgToCore)
            .then(() =>{console.log('yes sending sms')})
            .catch((e:any) => {
                this.loadingController.dismiss();
                this.toolService.showAlertBasic('','Error, send sms to core:'
                  ,e,['Ok']);
                  this.closeModal();
                  return
            })
          }

          // #endregion  --------------
          
          //  send code to visitor
          if(SendVisitor){
            await this.sendSMS(this.visitorSim,'codigo ' + coreName 
              + ': ' + this.code + '  Expira en ' + expire + ' Hrs.' )
            .then()
            .catch((e:any)=>{
              this.toolService.showAlertBasic('','code not send to visitor'
                  ,'error, ' + e,['Ok']);
            })
          }

          this.loadingController.dismiss();
          this.closeModal();

          },
          error =>{
            this.loadingController.dismiss();
            this.toolService.showAlertBasic('','Can not create code'
            ,'error: ' + error,['Ok']);
          });

        }catch(err){
          this.loadingController.dismiss();
          this.toolService.showAlertBasic('','Can not create code'
            ,'error: ' + err,['Ok']);
        }

      });

  }

  async sendSMS(sim:string,text:string){
    var options:SmsOptions={
      replaceLineBreaks:false,
      android:{
        intent:''
      }
    }

    const use_twilio =  await localStorage.getItem('twilio');

    try{

      if(use_twilio == 'false'){
          await this.sms.send(sim,text);
      }else{
        this.api.postData('api/twilio/open/' + this.userId + '/' + text + '/' + sim,'')
      }
    }
    catch(e){
      // alert('Text was not sent !')
      const toast = await this.toast.create({
        message : 'Text was not sent !.. error: ' + e,
        duration: 3000
      });

        toast.present();
      }
  }

  //#region -----------------------   QR -----------------------------

  captureQRscreen(){
    const element = document.getElementById('qrImage') as HTMLElement;
    html2canvas(element).then((canvas: HTMLCanvasElement) => {
      this.shareImage(canvas);
    });
  }

  async shareImage(canvas:HTMLCanvasElement){

    let base64 = canvas.toDataURL();
    let path = 'qr.png';

    
    const loading = await this.loadingController.create({
      // message: ' Mandando codigo ...',
      translucent: true,
      spinner: 'crescent'
    });
      await loading.present();

      await Filesystem.writeFile({
        path,
        data:base64,
        directory: Directory.Cache,
      })
      .then(async (res:any) => {
        let uri = res.uri;
        await Share.share({
          url: uri
        })
        .then(async () =>{
          await Filesystem.deleteFile({
            path,
            directory:Directory.Cache
          })

          // send code to mongo and core device 
          this.onSubmitTemplate(false)
        })
        .catch((err:any) => {
          console.log('error sharing, ' + err.message)
        
        });
        
      }).finally(() =>{
        this.loadingController.dismiss();
      })
    
  }

  //#endregion -------------------  QR --------------------------------

   // -------   show alerts              ---------------------------------
   async showAlerts(header:string,message:string){
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


  async openVisitorModal() {
    const modal = await this.modalController.create({
      component: VisitorListPage,
    });

    modal.onDidDismiss()
    .then(async (item) => {

      if(item.data){
        this.selectedVisitor = item.data;
        this.visitorCode = item.data['name'] ? item.data['name'] : ''  ;
        this.visitorSim = item.data['sim'] ? item.data['sim'] : '';
      }
    })

    return await modal.present();
  }

  closeModal(){
    this.modalController.dismiss(this.codeCreated);
  }

}
