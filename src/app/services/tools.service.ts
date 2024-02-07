import { Injectable } from '@angular/core';
import { AlertController,ToastController } from "@ionic/angular";

const netStatus = 'netStatus';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(
    private alertCtrl :AlertController,
    public toast: ToastController,
  ) { }


  async showAlertBasic(Header:string, subHeader:string,
    msg:string, btns:any) {
    const alert = await this.alertCtrl.create({
      header: Header,
      subHeader: subHeader,
      message:  msg,
      buttons: btns
    });
  
    await alert.present();
  }

  async toastAlert(msg:string,duration:number,btns:any,
      position: 'top' |'middle'| 'bottom'){
    const myToast = await this.toast.create({
      message:msg,
      duration:duration,
      buttons: btns,
      position:position
    });
      myToast.present();
  }

  async verifyNetStatus(){
    const cnnStatus = await JSON.parse(localStorage.getItem('netStatus'));
    console.log('verifyNetStatus', cnnStatus);
    if(!cnnStatus?.connected)
    {
      return false;
    }else{
      return true;
    }
  }

}
