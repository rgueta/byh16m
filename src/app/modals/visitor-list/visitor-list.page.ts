import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from "@ionic/angular";
import { Utils } from "../../tools/tools";
import { VisitorsPage } from "../visitors/visitors.page";

@Component({
  selector: 'app-visitor-list',
  templateUrl: './visitor-list.page.html',
  styleUrls: ['./visitor-list.page.scss'],
})
export class VisitorListPage implements OnInit {
  myVisitors:any;
  selectedVisitor:{}

  constructor(
    private modalController : ModalController,
    private alertController : AlertController

  ) { }

  ngOnInit() {
    this.getVisitors();
  }

  async getVisitors(){
    this.myVisitors = await JSON.parse(localStorage.getItem('visitors'))

    //Sort Visitors by name
    this.myVisitors = await Utils.sortJsonVisitors(this.myVisitors,'name',true);

}

toggleSection(item:{}){
  this.selectedVisitor = item;
  this.closeModal();
}

deleteVisitor(index:number,item:any){
  console.log(this.myVisitors);
  console.log(`delete --> ${index} ` , item);
}

async addVisitor(){
  const modal = await this.modalController.create({
    component: VisitorsPage,
  });

  modal.onDidDismiss()
  .then(async (item)=>{
    console.log('item from visitors -->', item);
    if(item.data){

      // Put local visitors to local variables
      this.myVisitors = await JSON.parse(localStorage.getItem('visitors'))

    //Sort Visitors by name
    this.myVisitors = await Utils.sortJsonVisitors(this.myVisitors,'name',true);

    }else{
      console.log('No Llamar getVisitors and sort')
    }
  })

  return await modal.present();
}

async removeVisitor(index:number,name:string){
  const alertControl = await this.alertController.create({
    header: 'Borrar al visitante ?',
    message: name,
    buttons: [
      {
      text: 'Cancelar',
        role: 'cancel',
        cssClass: 'icon-color',
        handler: () => {}
      },{
          text:'Si',
          handler:async () => {
            try{
              console.log('Se borrara --> ', this.myVisitors[index]);
              this.myVisitors.splice(index,1)
              localStorage.setItem('visitors',JSON.stringify(this.myVisitors));
              this.myVisitors[0].open = true;
            }
            catch(e){
              alert('No se pudo borrar');
            }
          }
        }
    ]
  });

  await alertControl.present();

}

closeModal(){
    this.modalController.dismiss(this.selectedVisitor);
  }

}
