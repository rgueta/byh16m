import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams,ToastController, AlertController } from "@ionic/angular";
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
    this.devicePkg = localStorage.getItem('device-pkg');

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


  sendRequest(){
      this.api.postData('api/pwdResetReq/' + this.email.value + 
      ',$2a$10$o6dqUxvror8V2jIL3c0P2uiNvKojin6zXfNYE1odsb.4XeUeuibF.',
      this.devicePkg).then(async result => {  
        console.log('psswordRST_request result -- > ', result);
        console.log('Object.value [1] -- > ', Object.values(result)[1]);

        if(Object.values(result)[1] == 'Locked'){
          this.showAlert('Alerta','', 'Este usuario esta bloqueado', ['Ok']);
        }else{
          this.showAlert('Alerta','', 
            'Reciviras un correo para recuperar tu contraseña', ['Ok']);
        }
        
      },err =>{
        console.log('pwdRST_request Error -- >', err);
        this.showAlert('Alerta','', 
            'El correo no esta relacionado a una cuenta', ['Ok']);
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

  async showAlert(Header:string, subHeader:string, msg:string, btns:any) {
    const alert = await this.alertCtrl.create({
      header: Header,
      subHeader: subHeader,
      message: msg,
      buttons: btns,
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
