import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  MyRole : string = 'visitor';
  constructor() {}

  async ionViewWillEnter(){
    this.MyRole = localStorage.getItem('my-role');
  }

}
