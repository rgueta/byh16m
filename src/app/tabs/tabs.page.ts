import { Component, OnInit } from '@angular/core';
// import { Plugins } from '@capacitor/core';
// const { Storage } = Plugins;
import { Storage } from "@capacitor/core";

const USER_ROLES = 'my-roles';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  public SoyAdmin = false;

  
  myRoles:any;

  constructor() { }
  
  async ionViewWillEnter(){
    console.log('------------------ ionViewWillEnter tabs.page ----------------');
    await Storage.get({key : 'IsAdmin'}).then(val => {
      if(val.value === 'true'){
        this.SoyAdmin = true;
      }else{
        this.SoyAdmin = false;
      }
    });
    console.log('tabs Soy admin -->' ,this.SoyAdmin);
  }


}
