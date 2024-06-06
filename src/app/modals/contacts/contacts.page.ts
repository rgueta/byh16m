import { Component, OnInit } from '@angular/core';
import { ModalController,AlertController, isPlatform,
       LoadingController} from '@ionic/angular';
import { Contacts, GetContactsResult } from "@capacitor-community/contacts";
import { Utils } from "../../tools/tools";
import { ToolsService } from "../../services/tools.service";



@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  myToast : any;
  // public contacts: Observable<[Contact]>;
  // contacts: Observable<Contact[]>;
  // contacts: Observable<Contact[]>;
  // public contacts? : GetContactsResult;
  public contacts : any = [];
  // Contacts : {}
  contact = {};
  constructor(private modalController : ModalController,
              private loadingController : LoadingController,
              public alertCtrl: AlertController,
              private toolService:ToolsService
              ) {
   }

  async ngOnInit() {
    await this.basicLoader();
    await this.loadContacts();

  }

  async loadContacts(){
      this.contacts = JSON.parse(localStorage.getItem('lista'));
      try{
        await Contacts.getContacts({
          projection: {
            // Specify which fields should be retrieved.
            name: true,
            phones: true,
            postalAddresses: true,
            emails:true,
            image:true
          }
        }).then(async (result) => {
          let localcontacts = await result.contacts;
          let allName : any = [];
          await localcontacts.forEach(async (item: any) => {
            if(item.name) await allName.push(item);
          });

          this.contacts = await Utils.sortJSON(allName,'display',true);
          // await localStorage.setItem('lista',await JSON.stringify(this.contacts));
        });

      }catch(e){
        this.toolService.toastAlert('Get contacts, error:<br>' + e,0,['Ok'],'middle');
      }
  }

  basicLoader() {
    this.loadingController.create({
        message: 'Please wait...',
        duration: 3000,
        translucent: true
    }).then((res) => {
        res.present();
    });
}

  async onClickContact(Contact: {}){
    this.contact = Contact;

    // >> Confirmation ------------------------------------

    let alert = await this.alertCtrl.create({
      subHeader: 'Confirmar',
      message: 'Aceptar contacto ?',
      cssClass:'basic-alert',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'icon-color',
          handler: () => {
          }
        },
        {
          text: 'Si',
          cssClass: 'icon-color',
          handler: async () => {
              this.closeModal();
          }
        }
      ]
    });

    await alert.present();

    // << Confirmation  -----------------------------------

  }

  closeModal(){
    this.modalController.dismiss(this.contact);
  }

}
