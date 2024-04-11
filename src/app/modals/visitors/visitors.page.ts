import { Component, OnInit, Input } from '@angular/core';
import { ModalController,AlertController, isPlatform, ToastController, AnimationController } from '@ionic/angular';
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";
import { DatabaseService } from "../../services/database.service";
import { ContactsPage } from "../../modals/contacts/contacts.page";


const VISITORS = 'visitors';

@Component({
  selector: 'app-visitors',
  templateUrl: './visitors.page.html',
  styleUrls: ['./visitors.page.scss'],
})
export class VisitorsPage implements OnInit {
  RegisterForm : FormGroup;
  @Input() name:string = '';
  @Input() email:string = '';
  @Input() sim: string = '';
  @Input() address: string= '';
  // @Input() gender:String;
  @Input() avatar: string = '';


  myToast : any;
  public gender = "H";
  // contacts: Observable<Contact[]>;
  contacts: [];
  contactSelected:any = {};
  userId : string;
  visitors: any = [];
  pkg:{};

  constructor(
    private modalController : ModalController,
    private toast : ToastController,
    public api:DatabaseService,
    private animationController : AnimationController,
  ) { 
    
    this.RegisterForm = new FormGroup({
      LocalName : new FormControl('', [Validators.required]),
      LocalSim : new FormControl('', [Validators.required]),
    });
  }

  async ngOnInit() {

    this.userId = await localStorage.getItem('my-userId');

    if(localStorage.getItem(VISITORS) != null){
      this.visitors = await JSON.parse(localStorage.getItem(VISITORS));
    }
  }
  
  async appendVisitor(pkg:any){
    await this.visitors.push(pkg);
    localStorage.setItem(VISITORS, JSON.stringify(this.visitors));
    console.log('visitor added --> ', this.visitors)
  }

  async onSubmit(){
    this.pkg = {'name':this.name,'sim':this.sim,'email':this.email,
      'address': this.address,'gender': this.gender, 'date': new Date()}
    this.appendVisitor(this.pkg);
    this.closeModal();

  }

  async onSubmit_(){
    await this.api.postData('api/visitors/' + this.userId ,{'userId': this.userId,
      'name':this.name,'email':this.email,'sim':this.sim,'address':this.address,
        'gender':this.gender,'avatar':this.avatar}).then(async (result:any) => {
      console.log('omSubmit Closing modal ...!');
        await this.closeModal()
      }, err => {
        alert('No se agrego el contacto');
      }
    );

  }

        // ---- Animation controller  ----------------------------------
  async modalContacts() {
    const modal = await this.modalController.create({
      component: ContactsPage,
      backdropDismiss:true,
      cssClass:"my-modal",
      componentProps: {contact: this.contactSelected}
    });

    modal.onDidDismiss()
    .then(async (data) => {
      this.name = '';
      this.email = '';
      this.sim ='';
      this.contactSelected = await data['data'];

      if(this.contactSelected.phones){
        this.name = await this.contactSelected.name['display'];
      }
      if(this.contactSelected.phones){
        this.sim = this.contactSelected.phones[0]['number'];
      }
      if(this.contactSelected.emails){
        this.email = this.contactSelected.emails[0]['address'];
      }
    });
  
    modal.present()
  }
  
         // -------   toast control alerts    ---------------------
   toastEvent(msg:string){
    this.myToast = this.toast.create({
      message:msg,
      duration:2000
    }).then((toastData) =>{
      console.log(toastData);
      toastData.present();
    });
  }

  closeModal(){
    this.modalController.dismiss(this.pkg,'dismiss');
  } 


}
