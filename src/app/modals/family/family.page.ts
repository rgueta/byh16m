import { Component, OnInit } from '@angular/core';
import { ModalController } from "@ionic/angular";
import { DatabaseService } from "../../services/database.service";


@Component({
    selector: 'app-family',
    templateUrl: './family.page.html',
    styleUrls: ['./family.page.scss'],
    standalone: false
})
export class FamilyPage implements OnInit {
  myFamily : any = [];
  selectedUser:any;
  public routineOpen=false;
  automaticClose = false;

  constructor(
    private modalController:ModalController,
    private api:DatabaseService
  ) { }

  ngOnInit() {
    this.getFamily();
  }

  async getFamily(){
    await this.api.getData('api/users/family/' + localStorage.getItem('my-userId')).subscribe(async (result:any) => {
      this.myFamily = result;
      this.myFamily[0].open = true;
    });

  }

  toggleSection(index:number){
    this.myFamily[index].open = !this.myFamily[index].open;
    if(this.automaticClose && this.myFamily[index].open){
      this.myFamily
      .filter((item:{}, itemIndex:number) => itemIndex != index)
      .map((item:any) => item.open = false);
    }
  }

  reportePerdido(index:number,item:any){
    console.log('Reportar --> ', index, 'item --> '+ JSON.stringify(item))
  }

  checkDefault(user:any){}
  OnUserChanged(user:string){}



  toggleSectionRoutines(){
    this.routineOpen = !this.routineOpen
  }
  collectUsers(id:string,name:string){}
  modalRegister(id:string,name:string,location:string){}
  ModuleRST(){}
  getSIMstatus(){}
  getCoreCodes(){}

closeModal(){
  this.modalController.dismiss();
}

}
