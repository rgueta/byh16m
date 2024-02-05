import { Injectable } from '@angular/core';
import { AlertController,ToastController } from "@ionic/angular";

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

  async toastAlert(msg:string,duration:number,btns:any){
    const myToast = await this.toast.create({
      message:msg,
      duration:duration,
      buttons: btns
    });
      myToast.present();
  }

  // toastEvent(msg:string,duration:number,btns:any){
  //   this.toast.create({
  //     message:msg,
  //     duration:duration,
  //     buttons: btns
  //   }).then((toastData) =>{
  //     toastData.present();
  //   });
  // }
}
