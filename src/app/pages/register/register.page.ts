import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";
import { DatabaseService } from '../../services/database.service';
import { Storage, Plugins } from "@capacitor/core";
import { Router } from "@angular/router";
import { Sim } from "@ionic-native/sim/ngx";
import { environment } from "../../../environments/environment";

const { Device } = Plugins;

const DEVICE_UUID = 'device-uuid';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  @Input() CoreId:string;
  @Input() Core:string;
  RegisterForm : FormGroup;

  localName:any;
  localUsername:any;
  localEmail:any;
  localPwd:any;
  localPwdConfirm:any;
  localSim:any;
  localuuid:any;
  gender:any;
  public localCore:any;
  localHouse:any;
  rolesList:any;
  rolesSelected:any;
  public CoresList:{};
  device_info:any;


// -- Validators  ------------

  constructor(public api : DatabaseService,
              public modalController : ModalController,
              public router : Router,
              private SIM : Sim
              ) {

    this.RegisterForm = new FormGroup({
      name : new FormControl('', [Validators.required]),
      username : new FormControl('', [Validators.required,Validators.minLength(5)]),
      email : new FormControl('', [Validators.required]),
      core : new FormControl('', [Validators.required]),
      pwd : new FormControl('', [Validators.required,Validators.minLength(8)]),
      pwdConfirm : new FormControl('', [Validators.required,Validators.minLength(8)]),
      sim : new FormControl('', [Validators.required]),
      house : new FormControl('', [Validators.required]),
      gender : new FormControl('', [Validators.required])
    });

   }

 async ngOnInit() { 
  this.device_info = await Device.getInfo();
  await Storage.set({key: DEVICE_UUID, value: this.device_info.uuid});
  this.localuuid = this.device_info.uuid;
  }


  async rolesSelection(rolesId){
    console.log(rolesId);
    this.rolesSelected = rolesId;

  }

  async sendRegister(){
    const use_twilio =  await Storage.get({key:'twilio'});
    const userId =  await Storage.get({key : 'my-userId'});
    const data =  {'name':this.localName,'username':this.localUsername,'uuid': this.localuuid,
    'email': this.localEmail,'pwd' : this.localPwd,'sim' : this.localSim , 
    'gender': this.gender,'core': this.localCore,'house' : this.localHouse, 
    'roles': [environment.db.neighbor_role],'status' : environment.db.register_status};

      try{
        if(use_twilio.value == 'false'){
          await this.api.postRegisterData('api/users/register/',data);
        }else{

        await this.api.postRegisterData('api/twilio/users/register/',data);
       
      }
      }catch(err){
        console.log('Can not post new register', err);
      }
  }

  async setupCore($event){
    
    console.log('localCore -> ' + this.localCore);
    // console.log('core -> ' + core);
  }

  closeModal(){
    this.router.navigateByUrl('/login' , {replaceUrl : true});
  } 
}
