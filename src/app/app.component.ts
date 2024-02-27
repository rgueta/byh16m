import { Component } from '@angular/core';
import { Network, ConnectionStatus } from "@capacitor/network";
// import { PluginListenerHandle } from "@capacitor/core";
import { ToolsService } from "./services/tools.service";

const netStatus = 'netStatus';

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
    private toolService:ToolsService
  ) {
<<<<<<< HEAD

    const cnnStatus = JSON.parse(localStorage.getItem('netStatus'));
    var visitors = localStorage.getItem('visitors');
    localStorage.clear();
    localStorage.setItem('visitors',visitors);
    localStorage.setItem('netStatus', JSON.stringify(cnnStatus));

=======
    // localStorage.clear();
>>>>>>> local-contacts
    this.checkNetwork()
  }



  async checkNetwork(){
      
  //  this.networkListener = 
   await Network.addListener('networkStatusChange',
    async (status) => {
      console.log('network Status changed: ', status);
      this.netStatus = await status?.connected;
      console.log('cnn Status: ', this.netStatus);

      await localStorage.setItem('netStatus',JSON.stringify(status));

      // if(!this.netStatus && status?.connectionType != 'cellular'){
      //   // const type = await status?.connectionType != 'none' ? status?.connectionType : ''
      //   // await this.toolService.toastAlert('Se perdio acceso a la red',0,['Ok']);
      // }else if(this.netStatus ){
        
      // }
    });

    const status = await Network.getStatus();
    // console.log('Network status 1: ', status);
    this.changeNetStatus(status);
    // console.log('cnn status: ', this.netStatus);
    
  }
  
  async changeNetStatus(status:any){
    await localStorage.setItem('netStatus',JSON.stringify(status));
    this.netStatus = status?.connected;
  }
}