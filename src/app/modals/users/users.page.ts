import { Component, OnInit, Input } from '@angular/core';
import { ModalController,AlertController,ToastController  } from '@ionic/angular';
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";
import { DatabaseService } from '../../services/database.service';
import { Storage, Plugins } from "@capacitor/core";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { Sim } from "@ionic-native/sim/ngx";

const { Device } = Plugins;

const DEVICE_UUID = 'device-uuid';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  @Input() CoreId:string;
  @Input() CoreName:string;
  @Input() pathLocation:string;
  
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
  public fromUrlParam:any;
  MsgAlert:any;
  myToast:any;
  userId = {};
  localCountry : String;
  localState : String;
  localCity : String;
  localDivision : String;
  localCpu : String;

  public countriesList : any;
  public statesList : any ;
  public citiesList : any;
  public divisionsList : any;
  public cpusList : any;
  public coresList : any;
  public strLocation : String;
  public localInfo:any;
  

// -- Validators  ------------

  constructor(public api : DatabaseService,
              public modalController : ModalController,
              public location : Location,
              public router : Router,
              private SIM : Sim,
              private alertController: AlertController,
              private toast: ToastController,
              ) {


    this.RegisterForm = new FormGroup({
      name : new FormControl('', [Validators.required]),
      username : new FormControl('', [Validators.required,Validators.minLength(5)]),
      email : new FormControl('', [Validators.required]),
      // core : new FormControl('', [Validators.required]),
      pwd : new FormControl('', [Validators.required,Validators.minLength(8)]),
      pwdConfirm : new FormControl('', [Validators.required,Validators.minLength(8)]),
      sim : new FormControl('', [Validators.required]),
      uuid : new FormControl('', [Validators.required]),
      house : new FormControl('', [Validators.required]),
      roles : new FormControl('', [Validators.required])
    });

   }

 async ngOnInit() {
  this.getRoles();
  this.getCores();
  }

  async getCores(){
    await this.api.getData('api/cores/onlyCores').subscribe(async result =>{
      console.table(result);
      this.CoresList = await result;
    });
  }

  async getRoles(){
    await this.api.getData('api/roles').subscribe( async result => {
        this.rolesList = await result;
        // console.table(this.rolesList);
    });

  }


  async rolesSelection(rolesId){
    console.log(rolesId);
    this.rolesSelected = rolesId;

  }

  async sendNewUser(){
    if (this.localPwd == this.localPwdConfirm){
      const userId =  await Storage.get({key : 'my-userId'});

      try{
         this.api.postRegister('api/users/user/' + userId['value'],
        {'name':this.localName,'username':this.localUsername,'uuid': this.localuuid,
        'email': this.localEmail,'pwd' : this.localPwd,'sim' : this.localSim , 
        'gender': this.gender,'core': this.CoreId,'house' : this.localHouse,
        'roles':this.rolesSelected,'location': this.pathLocation}).subscribe(async res => {
          if(res['status'] == 200){
            this.toastEvent(res['msg']);
          }else{
            this.toastEvent('Error: ' + res['msg']);
          }
        })
      }catch(err){
        console.log('Can not post user data', err);
        this.toastEvent('Can not post user data err: ' + err);
      }
    }else{
      this.toastEvent('Passwords do not match ');
    }
  }

  async setupCore($event){
    
    console.log('localCore -> ' + this.localCore);
    // console.log('core -> ' + core);
  }

  closeModal(){
    this.modalController.dismiss();
  } 


  // -------   show alerts              ---------------------------------
  async showAlerts(header,message){
    this.MsgAlert = await this.alertController.create({
      cssClass : "basic-alert",
      header: header,
      message: message,
      buttons: [
        { text : 'OK'}
      ],
    });
    await this.MsgAlert.present();
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
