import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams,AlertController } from "@ionic/angular";
import { DatabaseService } from '../../services/database.service';
import { UpdUsersPage } from "../../modals/upd-users/upd-users.page";

@Component({
  selector: 'app-backstage',
  templateUrl: './backstage.page.html',
  styleUrls: ['./backstage.page.scss'],
})
export class BackstagePage implements OnInit {

  backstageList :any;
  simSectionOpen = false;

  constructor(
    private modalController: ModalController,
    private api : DatabaseService,
    public alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.getBackstage();
  }

  async getBackstage(){
    this.api.getData('api/backstage/' + localStorage.getItem('my-userId') )
      .subscribe(async (result: any) => {
        this.backstageList = await result;
        this.backstageList[0].open = true;

      }, (error:any) => {
        console.log('Error response --> ', JSON.stringify(error));
      });
  }

  toggleSection(index:number){
    this.backstageList[index].open = !this.backstageList[index].open;
    if(this.backstageList && this.backstageList[index].open){
      this.backstageList
      .filter((item:{}, itemIndex:number) => itemIndex != index)
      .map((item:any) => item.open = false);
    }
  }

  async doRefresh(event:any){
    this.getBackstage();
  
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async addUser(pkg:any){
    const modal = await this.modalController.create({
      component: UpdUsersPage,
      componentProps:{
        'SourcePage': 'admin',
        'pkg': pkg
       }
    });
    
     await modal.present();
  }

  closeModal(){
    this.modalController.dismiss();
  }
}
