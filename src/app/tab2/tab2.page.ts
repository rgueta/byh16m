import { Component } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import {Utils} from '../utils';
import { ToastController } from "@ionic/angular";
import { from } from 'rxjs';
import { isEmpty } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

// import { Storage } from "@capacitor/storage";
// const { Storage } = Plugins;

import { Storage } from "@capacitor/core";

const USERID = 'my-userId';
const REFRESH_TOKEN_KEY = 'my-refresh-token';
const TOKEN_KEY = 'my-token';
const CORE_SIM = 'my-core-sim';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public EventsList:any;
  public myEventsList:any;
  automaticClose = false;
  Core_sim : any;
  public filterDay : any;
  myToken : any;
  myRefreshToken : any;
  myToast:any;
  myUserId:any;

  constructor(
    // private storage : Storage,
    public api : DatabaseService,
    private toast : ToastController
  ) {}

  async ionViewWillEnter() {
    this.filterDay = Utils.convDate(new Date());
    this.myUserId = await Storage.get({key : USERID});
    this.myToken = await Storage.get({key : TOKEN_KEY});
    // this.Core_sim =  await this.storage.get('my-core-sim');

    this.Core_sim = await Storage.get({key : CORE_SIM});

    this.getEvents();
  }

  async getEvents(){
    var start = new Date(this.filterDay);
    var end = new Date(this.filterDay);
    start.setUTCHours(0,0,0,0);
    end.setUTCHours(23,59,59,0);

    start = await Utils.convDate(start);
    end = await Utils.convDate(end);

      await this.api.getData_key('api/codeEvent/' + this.myUserId.value + '/' +
      this.Core_sim.value + '/' + start + '/' + end,this.myToken.value).subscribe(async result =>{
      
      this.EventsList = await result;
      if(this.EventsList.length > 0){
        console.log('------------ Si hay eventos ---------------- ');
        this.EventsList[0].open = true;
      }else{
        console.log('------------ No hay eventos ---------------- ');
        const toast = await this.toast.create({
          message : 'No hay eventos para esta fecha',
          // position : 'top',
          duration : 3000
        });
        toast.present();
      }
    });
}

  async doRefresh(event) {
    this.EventsList = null;
    this.getEvents();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async onChangeInitial($event){
    this.EventsList = null;
    this.filterDay = Utils.convDate(new Date($event));
    var start = await new Date($event);
    // var start = await new Date($event).toISOString().split('T')[0];
    var end = await new Date($event);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,0);


    console.log('start --> ', start)
    console.log('end --> ', end)

    // this.storage.get('my-token').then(valToken =>{
    //   this.myToken = valToken;
    // })
    // this.myRefreshToken = await this.storage.get('my-refresh-token');

    // console.log('tab2.page doRefresh myToken -> ', this.myToken.value);

    await this.api.getData_key('api/codeEvent/'  + this.myUserId.value + '/' + this.Core_sim.value + '/' + 
          start + '/' + end,this.myToken.value).subscribe(async result =>{
      this.EventsList = await result;
      if(this.EventsList.length > 0) {
        this.EventsList[0].open = true;
      }
    });
  }

  toggleSection(index){
    this.EventsList[index].open = !this.EventsList[index].open;
    if(this.automaticClose && this.EventsList[index].open){
      this.EventsList
      .filter((item, itemIndex) => itemIndex != index)
      .map(item => item.open = false);
    }
  }

  toggleItem(index, childIndex){
    this.EventsList[index].children[childIndex].open = !this.EventsList[index].open;
  }


   // -------   toast control alerts    ---------------------
   toastEvent(msg){
    this.myToast = this.toast.create({
      message:msg,
      duration:2000
    }).then((toastData) =>{
      console.log(toastData);
      toastData.present();
    });
  }

}

