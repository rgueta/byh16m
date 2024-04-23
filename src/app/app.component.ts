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

    this.checkNetwork()
  }

  async checkNetwork(){
   await Network.addListener('networkStatusChange',
    async (status) => {
      this.netStatus = await status?.connected;
      await localStorage.setItem('netStatus',JSON.stringify(status));
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