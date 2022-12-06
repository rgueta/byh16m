import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { environment } from "../../../environments/environment";
import { DatabaseService } from "../../services/database.service";


@Component({
  selector: 'app-pwd-reset',
  templateUrl: './pwd-reset.page.html',
  styleUrls: ['./pwd-reset.page.scss'],
})
export class PwdResetPage implements OnInit {

credentials: FormGroup;
 creds = {
   email :''
 };
 myToast:any;
 public version = '';

  constructor(private fb: FormBuilder,
    private alertController: AlertController,
    public api : DatabaseService,
    public toast:ToastController,
    ) { }

  ngOnInit() {
    this.version = environment.app.version;
    this.credentials = this.fb.group({
      email: ['ricardogueta@gmail.com', [Validators.required, Validators.email]]
    });
  }

  psswordRST_request(){
    console.log('call psswordRST_request');

    // this.api.post_pwdRST('api/pwdResetReq/' + this.email.value).subscribe(async result => {
    this.api.post_pwdRST('api/pwdResetReq/' + this.email.value).subscribe(async result => {
    // this.api.post_pwdRST('api/pwdResetReq/email/').subscribe(async result => {
      console.log('psswordRST_request result -- >', result);
      this.toastEvent('Reciviras un correo para recuperar tu contraseña ..',5000)
    },err =>{
      console.log('psswordRST_request Error -- >', err);
      this.toastEvent('No se envio el correo, el correo no esta relacionado a una cuenta  ..',5000)
    });

    // this.api.postData_noToken('api/pwdResetReq/' + this.email.value).subscribe(async result => {
    //   console.log('psswordRST_request result -- >', result);
    //   this.toastEvent('Reciviras un correo para recuperar tu contraseña ..',5000)
    // },err =>{
    //   console.log('psswordRST_request Error -- >', err);
    //   this.toastEvent('No se envio el correo, el correo no esta relacionado a una cuenta  ..',5000)
    // });
    
  }

  

  get email() {
    return this.credentials.get('email');
  }

   // -------   toast control alerts    ---------------------
   toastEvent(msg,time){
    this.myToast = this.toast.create({
      message:msg,
      duration:time
    }).then((toastData) =>{
      console.log(toastData);
      toastData.present();
    });
  }
}
