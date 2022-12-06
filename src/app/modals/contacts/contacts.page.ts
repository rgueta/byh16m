import { Component, OnInit } from '@angular/core';
import { ModalController,AlertController, isPlatform, 
  ToastController, LoadingController} from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Contact} from "@capacitor-community/contacts";
import { Plugins } from "@capacitor/core";

const { Contacts } = Plugins;

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  myToast : any;
  // contacts = [];
  contacts: Observable<Contact[]>;
  contact={};
  constructor(private modalController : ModalController,
              private loadingController : LoadingController,
              private toast: ToastController,) {
   }

  async ngOnInit() {
    this.loadContacts();
    this.basicLoader();
  }

  // async getPermissions(): Promise<void>{
  //   console.log('getting permissions')
  //   Contacts.getPermissions();
  // }

  async loadContacts(){
    const loading = await this.loadingController.create({
      cssClass:'loader-css-class',
      backdropDismiss:true
    });
    await loading.present();
    
    if(isPlatform('android')){
      try{
        
    // const res = await Contacts.getPermissions();

        // await Contacts.getPermissions().then(async (result) => {
        //   console.log('Si entre ..')
        //   if (!result.granted){
        //     this.toastEvent('No permission granted...!');
        //     return
        //   }else{
        //     console.log('Si hay permisos en contactos')
        //   }
        // });
        
        Contacts.getContacts().then(async result => {
          console.log('Contacts result --> ',result);
          this.contacts = result.Contacts
          // const phoneContacts: [Contact] = await result.contacts;
          // this.contacts = await of(phoneContacts);
          // await loading.dismiss();
        })

        }catch(e){
          this.toastEvent('Error to get permissions --> ' + e);
      }
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

  async onClickContact(Contact){
    this.contact = Contact;
    // alert('selected: ' + contactName + ', ' + JSON.stringify(contactNumbers))
    this.closeModal();
  }

  closeModal(){
    this.modalController.dismiss(this.contact);
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
