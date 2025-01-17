import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams,ToastController,
   AlertController } from "@ionic/angular";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DatabaseService } from "../../services/database.service";


const DEVICE_PKG = 'device-pkg';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
})
export class RequestsPage implements OnInit {
  title: string ;
  validator: FormGroup;
  myToast:any;
  devicePkg:any;

  constructor(
    private modalController:ModalController,
    private navParams:NavParams,
    private api:DatabaseService,
    private toast:ToastController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    // this.devicePkg = localStorage.getItem('device-pkg');
    this.devicePkg = localStorage.getItem('device_info');

    switch(this.navParams.data['request']){
      case 'UnblockAccount':
        this.title = 'Desbloquear usuario';
        break;

      case 'deviceLost':
        this.title = 'Reportar equipo perdido';
        break;
      
      case 'pwdReset':
        this.title = 'Recuperar contraseña';
        break;
      
      default:
        this.title = 'Request page';
        break;
    }

    this.validator = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.required]),
      comment: new FormControl('', [Validators.required, Validators.required]),
    });
  }

  async Validate(){
    this.showAlert('sendRequest','Confirmar','', 'Mandar requerimiento ?', 'btns','Si','No');

  }

  sendRequest(){
      this.api.postData('api/pwdResetReq/' + this.email.value,
      this.devicePkg).then(async result => {  

        if(Object.values(result)[1] == 'Locked'){
          this.showAlert('','Alerta','', 'Este usuario esta bloqueado', 'btns','Ok','');
        }else{
          this.showAlert('','Alerta','', 
            'Reciviras un correo para recuperar tu contraseña', 'btns','Ok','');
        }

        
      },err =>{
        console.log('pwdRST_request Error -- >', err);
        this.showAlert('','Alerta','', 
            'El correo no esta relacionado a una cuenta', 'btns','Ok','');
      });

  }

   // -------   toast and alert control alerts    ---------------------
   toastEvent(msg:string,time:number){
    this.myToast = this.toast.create({
      message:msg,
      duration:time
    }).then((toastData) =>{
      console.log(toastData);
      toastData.present();
    });
  }

  // -------   show alerts              ---------------------------------
  async showAlert(option:string,Header:string, subHeader:string, msg:string, btns:any,
    txtConfirm:string, txtCancel:string) {
    const alert = await this.alertCtrl.create({
      header: Header,
      subHeader: subHeader,
      message: msg,
      backdropDismiss:false,
      buttons: [
        {
        text:txtCancel,
        role: 'cancel'
      },
      {
        text:txtConfirm,
        handler: async () =>{
          switch(option){
            case 'salir':
              this.closeModal();
              break;
            case 'sendRequest':
              await this.sendRequest();
              break;
            
            default:
              break;

          }
          
        }
      
      }]
    });
  
    await alert.present();
  }


  closeModal(){
    this.modalController.dismiss();
  } 

  get email() {
    return this.validator.get('email');
  }

}
