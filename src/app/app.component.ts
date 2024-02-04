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
      
    await Network.addListener('networkStatusChange',
    async (status) => {
      console.log('network Status changed: ', status);
      this.netStatus = await status?.connected;
      console.log('cnn Status: ', this.netStatus);

      if(!this.netStatus && status?.connectionType != 'cellular'){
        // const type = await status?.connectionType != 'none' ? status?.connectionType : ''
        alert('Se perdio acceso a la red ');
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

  async checkNetwork_(){
    await Network.addListener('networkStatusChange', async (status) => {
      // console.log('Network status changed', status);
      const cnnStatus = await Network.getStatus();
      if(!cnnStatus?.connected){
        console.log('Network status 2: ', cnnStatus);
        alert('Se perdio el acceso\n a la red ' + cnnStatus?.connectionType );
      }
    });

    // const status = await Network.getStatus();
    // console.log('Network status 1: ', status);
    // this.changeNetStatus(status);
    // console.log('cnn status 2: ', this.netStatus);
    
    // const logCurrentNetworkStatus = async () => {
    //   const status = await Network.getStatus();
    
    //   console.log('Network status:', status);
    // };


    // console.log('que es: ', logCurrentNetworkStatus);

    // let dbgMsg = 'websocket.service constructor() ';
    // dbgMsg += 'logCurrentNetworkStatus(): ';
    // dbgMsg += JSON.stringify(logCurrentNetworkStatus());
    // console.debug(dbgMsg);
  }
}