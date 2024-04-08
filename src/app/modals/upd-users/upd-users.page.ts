import { Component, OnInit } from '@angular/core';
import { ModalController } from "@ionic/angular";

@Component({
  selector: 'app-upd-users',
  templateUrl: './upd-users.page.html',
  styleUrls: ['./upd-users.page.scss'],
})
export class UpdUsersPage implements OnInit {

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  closeModal(){
    this.modalController.dismiss();
  } 

}
