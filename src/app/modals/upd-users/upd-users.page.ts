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
  pkgUser:any;
  devicePkg:any;
  location:string = '';
  locationReadonly : boolean = true;
  id:string;
  uuid:string = '00-000';
  uuidReadonly : boolean = true;


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
      Location : new FormControl('', [Validators.required]),
      Uuid : new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.devicePkg = localStorage.getItem('device_info');

    this.sourcePage = this.navParams.data['SourcePage'];

    if(this.navParams.data['CoreId']){
      this.coreId = this.navParams.data['CoreId'];
    }
    
    if(this.navParams.data['CoreName']){
      this.coreName = this.navParams.data['CoreName'];
    }

    if(this.sourcePage == 'admin' || this.sourcePage == 'adminNew'){
      this.RoleList = JSON.parse(localStorage.getItem('roles'));
    }

    if(this.sourcePage == 'login' || this.sourcePage == 'adminNew'){
      this.getCpus();
    }
    
    if(this.sourcePage == 'admin'){
      if(this.navParams.data['pkg']){
        this.pkgUser = this.navParams.data['pkg'];
        this.coreName = this.pkgUser['coreName'];
        this.fillData();
      }
    }else if(this.sourcePage == 'adminNew'){
      this.locationReadonly = false;
      this.uuidReadonly = false;
    }
    else{
      // just to enable button because formGroup for user itself
      this.RegisterForm.get('Roles').setValue('some value');
      this.RegisterForm.get('Location').setValue('some value');
      this.RegisterForm.get('Uuid').setValue(localStorage.getItem('device-uuid'));
    }
  }

  async fillData(){
    this.id = this.pkgUser['_id'];
    this.name = this.pkgUser['name'];
    this.username = this.pkgUser['username'];
    this.email = this.pkgUser['email'];
    this.sim = this.pkgUser['sim'];
    this.house = this.pkgUser['house'];
    this.gender = this.pkgUser['gender'];
    this.location = this.pkgUser['path'];
    this.uuid = this.pkgUser['uuid'];

    this.RegisterForm.get('Cpu').setValue(this.pkgUser['cpu']);
    this.RegisterForm.get('Core').setValue(this.pkgUser['core']);
    this.RegisterForm.get('Name').setValue(this.name);
    this.RegisterForm.get('UserName').setValue(this.username);
    this.RegisterForm.get('Email').setValue(this.email);
    this.RegisterForm.get('Sim').setValue(this.sim);
    this.RegisterForm.get('House').setValue(this.house);
    this.RegisterForm.get('Gender').setValue(this.gender);
    this.RegisterForm.get('Location').setValue(this.location);
    this.RegisterForm.get('Uuid').setValue(this.pkgUser['uuid']);

  }

  async getCpus(){
    this.api.getData('api/cpus/')
      .subscribe(async (result: any) => {
        this.CpuList = await result;
      }, (error:any) => {
        this.toolService.showAlertBasic('Alerta','Error, getCpus: ',
                  JSON.stringify(error),['Ok']);
      });
  }

  async getCores(cpu:string){
    this.api.getData('api/cores/'+ cpu)
      .subscribe(async (result: any) => {
        this.CoreList = await result;
      }, 
      (error:any) => {
        this.toolService.showAlertBasic('Alerta','Error, getCores: ',
                  JSON.stringify(error),['Ok'])
      });
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

  async onChangeCpu(){
    this.getCores(this.localCpu['id'])
  }

  async onSubmit(){
    // get cpu, check if came as object
    const localCpu = 
      typeof this.RegisterForm.get('Cpu').value == 'object' ? 
      this.RegisterForm.get('Cpu').value['id'] :
      this.RegisterForm.get('Cpu').value ;

    const localCore = 
      typeof this.RegisterForm.get('Core').value == 'object' ? 
      this.RegisterForm.get('Core').value['id'] :
      this.RegisterForm.get('Core').value ;

    const pkg = {
      cpu: localCpu, 
      core: localCore,
      name: this.RegisterForm.get('Name').value,
      username: this.RegisterForm.get('UserName').value, 
      email: this.RegisterForm.get('Email').value,
      sim: this.RegisterForm.get('Sim').value,
      house: this.RegisterForm.get('House').value, 
      gender: this.RegisterForm.get('Gender').value,
      roles : this.localRole,
      uuid: this.uuid,
      location: this.location,
      avatar: ''
     }

     try{
      //  add new user 
      await this.api.postData('api/users/new/' + 
        localStorage.getItem('my-userId'), pkg)
        .then(async (res) => {
          // // create password reset
          // this.api.postData('api/pwdResetReq/' + this.RegisterForm.get('Email').value,
          this.api.postData('api/pwdResetReq/ricardogueta@gmail.com',
            JSON.parse(this.devicePkg))
            .then(async result => {
              if(this.sourcePage == 'admin'){
                // delete backstage document
                this.api.deleteData('api/backstage/'+ localStorage.getItem('my-userId') +
                  '/' + this.id)
                .then(async result => {})
                .catch((err) =>{ 
                  this.toolService.showAlertBasic('Alerta','Error, delete backstage: ',
                  JSON.stringify(err),['Ok']) })
              }
            })
            .catch((err) =>{
              this.toolService.showAlertBasic('Alerta','Error, pwd reset: ',
                JSON.stringify(err),['Ok']);
            })
        })
        .catch((rej) => { 
          this.toolService.showAlertBasic('Alert','Error api call','Can not add user, ' + 
            JSON.stringify(rej['error']['msg']), ['Ok']); });

      this.toolService.showAlertBasic('','Se agrego el usuario:',
        this.RegisterForm.get('Name').value,['Ok']);

      // exit model
      this.modalController.dismiss('refresh');

      }catch(err){
        console.log('error final catch', err);
      }
}

async sendToDevice(sim:string){
}


async onSubmitItSelf(cpu:string,core:string,name:string,username:string,
  email:string,sim:string,house:string,gender:any ){
    const comment = document.getElementById("comment");

    const pkg : {} = {'cpu':this.localCpu['id'], 'core': this.localCore['id'], 
      'name': name, 'username':username, 'email':email, 'sim':sim, 'house':house,
      'gender':gender,'note': comment.textContent, 'uuid':localStorage.getItem('device-uuid')
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
  })
  .catch((err) => {
    this.toolService.showAlertBasic('Alerta','Error', 
      JSON.stringify(err['error']['msg']),['Ok'])
  })
}

  async closeModal(){
    var empty : Boolean = true;

    if(this.sourcePage == 'login' ){

      const comment = document.getElementById("comment");
      if(this.cpu != '' || this.core || this.name || this.username != '' || this.email != '' || 
      this.sim != '' || this.house != '' || this.gender != '' || comment.textContent != ''){
        empty = false
      }
    }
    else{
      if(this.name || this.username != '' || this.email != '' || 
      this.sim != '' || this.house != '' || this.gender != '' ){
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
