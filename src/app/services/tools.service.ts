import { Injectable } from '@angular/core';
import { AlertController } from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(
    private alertCtrl :AlertController
  ) { }


  async showAlertBasic(Header:string, subHeader:string, msg:string, btns:any) {
    const alert = await this.alertCtrl.create({
      header: Header,
      subHeader: subHeader,
      message:  msg,
      buttons: btns
    });
  
    await alert.present();
  }
}
