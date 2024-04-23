import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams,AlertController } from "@ionic/angular";
import { DatabaseService } from '../../services/database.service';
import { UpdUsersPage } from "../../modals/upd-users/upd-users.page";
import { ToolsService } from "../../services/tools.service";

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
    public alertCtrl: AlertController,
    private toolService: ToolsService,
  ) { }

  ngOnInit() {
    this.getBackstage();
  }

  async getBackstage(){
    this.api.getData('api/backstage/' + localStorage.getItem('my-userId') )
      .subscribe(async (result: any) => {
        this.backstageList = await result;
        if(this.backstageList.length > 0){
          this.backstageList[0].open = true;
        }else{
          this.toolService.showAlertBasic('','Empty backstage collection', '',['Ok']);
          this.modalController.dismiss('no refresh');
        }

      }, (err:any) => {
        this.toolService.showAlertBasic('Alerta','Error, get backstage: ',
                JSON.stringify(err),['Ok']);
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

    await modal.onDidDismiss()
    .then(async (res) =>{
      if(res.data == 'refresh'){
        this.getBackstage();
      }
    });
  }

  closeModal(){
    this.modalController.dismiss('no refresh');
  }
}
