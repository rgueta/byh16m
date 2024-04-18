import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  SoyAdmin : boolean = false;
  SoyNeighborAdmin : boolean = false;
  myRoles:any;
  constructor() {}

  async ionViewWillEnter(){
    localStorage.getItem('IsAdmin') === 'true' ? 
    this.SoyAdmin = true : this.SoyAdmin = false ;

    localStorage.getItem('IsNeighborAdmin') === 'true' ? 
    this.SoyNeighborAdmin = true : this.SoyNeighborAdmin = false;
  }

}
