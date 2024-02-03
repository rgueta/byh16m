import { Component } from '@angular/core';
import { Network, ConnectionStatus } from "@capacitor/network";
// import { PluginListenerHandle } from "@capacitor/core";
import { ToolsService } from "src/app/services/tools.service";
import { ToastController } from "@ionic/angular";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  // networkListener: PluginListenerHandle;
  networkStatus: ConnectionStatus;
  netStatus : boolean;
  constructor(
    public toolService:ToolsService,
    public toast:ToastController
  ) {
    this.checkNetwork()
  }


  async checkNetwork(){
      
    Network.addListener('networkStatusChange',
    async (status) => {

      alert('Aviso desde app.component:\n\n' +
        'Ocurrio una excepción revisar: \n'+
      '1. Acceso a la red\n' +
      '2. Permiso para envio de sms'
      )

      // this.toolService.showAlertBasic('Aviso','Ocurrio una excepción revisar:',
      // `1. Acceso a la red<br>` +
      // `2. Permiso para envio de sms`,['Cerrar']);
    


      // let myToast = this.toast.create({
      //   message:'Cambió el estatus de red',
      //   duration:0,
      //   buttons: ['Ok']
      // });
      //   (await myToast).present();

      // this.myToast = this.toolService.toastEvent('Cambió el estatus de red' ,0,['Ok']);
      // this.myToast;

      // this.toastEvent(`Cambió el estatus de red<br>` +
      //   `red conectada ${status?.connected}` ,0,['Ok']);

        // this.toastEvent('Cambió el estatus de red' ,0,['Ok']);

      // this.toolService.toastEvent('Cambió el estatus de red' ,0,['Ok']);
      console.log('network Status changed: ', status);
      this.netStatus = status?.connected;
      console.log('cnn Status: ', this.netStatus);
    });

    const status = await Network.getStatus();
    console.log('Network status 1: ', status);
    this.changeNetStatus(status);
    console.log('cnn status: ', this.netStatus);
    
  }
  
  changeNetStatus(status:any){
    this.netStatus = status?.connected;
  }

}