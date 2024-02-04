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
      console.log('network Status changed: ', status);
      this.netStatus = status?.connected;
      console.log('cnn Status: ', this.netStatus);

      if(!this.netStatus && status?.connectionType != 'none'){
        alert('No hay acceso a la red \n');
      }
    });

    // const status = await Network.getStatus();
    // console.log('Network status 1: ', status);
    // this.changeNetStatus(status);
    // console.log('cnn status: ', this.netStatus);
    
  }
  
  changeNetStatus(status:any){
    this.netStatus = status?.connected;
  }

}