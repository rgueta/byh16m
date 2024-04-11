import { Component, OnInit, Input } from '@angular/core';
import { ModalController, NavParams,AlertController } from "@ionic/angular";
import { DatabaseService } from '../../services/database.service';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { SMS, SmsOptions } from '@ionic-native/sms/ngx';
import { ToolsService } from "../../services/tools.service";

@Component({
  selector: 'app-upd-users',
  templateUrl: './upd-users.page.html',
  styleUrls: ['./upd-users.page.scss'],
})
export class UpdUsersPage implements OnInit {
  RegisterForm:FormGroup;
  @Input() cpu:string = '';
  @Input() core:string = '';
  @Input() name:string = '';
  @Input() username:string = '';
  @Input() email:string = '';
  @Input() sim: string = '';
  @Input() house:string = '';
  @Input() roles: any = [];
  @Input() avatar: string = '';

  public UserItSelf : boolean = false;
  sourcePage:string = '';
  RoleList: any = [];
  CpuList: any = [];
  CoreList: any = [];
  coreId: string = '';
  coreName : string= '';
  public gender = "";
  localRole:String;
  localCpu:any;
  localCore:any;


  constructor(
    private modalController: ModalController,
    private navParams:NavParams,
    private api : DatabaseService,
    private sms: SMS,
    private toolService: ToolsService,
    public alertCtrl: AlertController
  ) { 
    this.RegisterForm = new FormGroup({
      Cpu : new FormControl('', [Validators.required]),
      Core : new FormControl('', [Validators.required]),
      Name : new FormControl('', [Validators.required]),
      UserName : new FormControl('', [Validators.required]),
      Email : new FormControl('', [Validators.required]),
      Sim : new FormControl('', [Validators.required]),
      House : new FormControl('', [Validators.required]),
      Gender : new FormControl('', [Validators.required]),
      Roles : new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.coreId = this.navParams.data['CoreId'];
    this.coreName = this.navParams.data['CoreName'];
    this.sourcePage = this.navParams.data['SourcePage'];

    if(this.sourcePage == 'admin'){
      this.getRoles()
    }else{
      this.getCpus();
      // just to enable button because formGroup for user itself
      this.RegisterForm.get('Roles').setValue('some value');
      this.UserItSelf = true;
    }
  }

  async getCpus(){
    this.api.getData('api/cpus/')
      .subscribe(async (result: any) => {
        this.CpuList = await result;
      }, (error:any) => {
        console.log('Error response --> ', JSON.stringify(error));
      });
  }

  async getCores(cpu:string){
    this.api.getData('api/cores/'+ cpu)
      .subscribe(async (result: any) => {
        this.CoreList = await result;
        console.log('cores --> ', result)
      }, (error:any) => {
        console.log('Error response --> ', JSON.stringify(error));
      });
  }

  async getRoles(){
    this.api.getData('api/roles/' + localStorage.getItem('my-userId'))
      .subscribe(async (result: any) => {
        this.RoleList = await result;
      }, (error:any) => {
        console.log('Error response --> ', JSON.stringify(error));
      });
  }

  async onChangeCpu(event:any){
    this.getCores(this.localCpu['id'])
  }

  async onSubmitItSelf(cpu:string,core:string,name:string,username:string,
    email:string,sim:string,house:string,gender:any ){
      const comment = document.getElementById("comment")
  
      const pkg : {} = {'cpu':this.localCpu['id'], 'core': this.localCore['id'], 'name': name, 'username':username, 
        'email':email, 'sim':sim, 'house':house, 'gender':gender,'note': comment.textContent,
        'uuid':localStorage.getItem('device-uuid')
      }

    // >> Confirmation ------------------------------------

    let alert = await this.alertCtrl.create({
      message: 'Mandar solicitud ?',
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
              this.sendUserReq(pkg);
          }
        }
      ]
    });

    return await alert.present();

    // << Confirmation  -----------------------------------

    }

   async sendUserReq(pkg:any){
    const admin_sim = JSON.parse(localStorage.getItem('admin_sim'));
      var options:SmsOptions={
        replaceLineBreaks:false,
        android:{
          intent:''
        }
      }

      this.api.postData('api/backstage/',pkg)
      .then( async (result:any) =>{
        const msg = `new user requested, cpu: ${this.localCpu['name']}, core: ${this.localCore['name']}, 
          house: ${pkg.house}, sim: ${pkg.sim}, email: ${pkg.email}`
        
        for(var key in admin_sim){
          await this.sms.send(admin_sim[key].sim, msg, options)
          .then()
          .catch((e:any) => 
              this.toolService.showAlertBasic('Alerta','Error',e,['Ok']));
        }

        this.modalController.dismiss();
      },
        error =>{this.toolService.showAlertBasic('Alerta','Error',
          JSON.stringify(error.error.msg),['Ok'])})
    }

  async onSubmit(){
      // let data: {} = {'cpu': this.cpu}
      // this.api.postData('api/backstage',)

  }

  async roleSelection(){

  }

  async closeModal(){
    var empty : Boolean = true;

    if(this.sourcePage == 'admin'){
      if(this.name || this.username != '' || this.email != '' || 
      this.sim != '' || this.house != '' || this.gender != '' ){
        empty = false
      }
    }
    else{
      const comment = document.getElementById("comment");
      if(this.cpu != '' || this.core || this.name || this.username != '' || this.email != '' || 
      this.sim != '' || this.house != '' || this.gender != '' || comment.textContent != ''){
        empty = false
      }

    }
   
    if(!empty){
          // >> Confirmation ------------------------------------

    let alert = await this.alertCtrl.create({
      subHeader: 'Se perdera la informacion',
      message: 'Deseas salir ?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Si',
          handler: async () => {
            this.modalController.dismiss();
          }
        }
      ]
    });

    return await alert.present();

    // << Confirmation  -----------------------------------

      }else{
        this.modalController.dismiss();
      }

  } 

}
