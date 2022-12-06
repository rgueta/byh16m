import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-upd-cores',
  templateUrl: './upd-cores.page.html',
  styleUrls: ['./upd-cores.page.scss'],
})
export class UpdCoresPage implements OnInit {
  updCoreForm : FormGroup;

  localName : any;
  localAddress : any;
  localWebService : any
  localSim : any;
  localHouse_qty : any;
  
  //----- Coordinates ----

  coordLat : any;
  coordLon : any;

  // ----- detail  -------
  localMotor : any;
  localGate_type : any;
  localGate_long : any;
  localGate_heigh : any;
  localPedestrian_type : any;
  localPedestrian_long : any;
  localPedestrian_heigh : any;
  localhousing_unit :any;
  localenable : any;
  // --- contact  -------
  localContact_name : any;
  localContact_email : any;
  localContact_phone : any;

  public SelectHousingUnitTitle : any = 'Housing unit';
  public myHousingUnitList:{};

  // -- Validators  ------------

  constructor(public api : DatabaseService,
    public modalController : ModalController) {

    this.updCoreForm = new FormGroup({
      Name : new FormControl('', [Validators.required]),
      Address : new FormControl('', [Validators.required]),
      Sim : new FormControl('', [Validators.required]),
      Coord : new FormControl('', [Validators.required]),
      House_qty : new FormControl('', [Validators.required]),
      webService : new FormControl('', [Validators.required]),
      housing_unit : new FormControl('', [Validators.required]),
      enable : new FormControl('', [Validators.required]),

      contact_name : new FormControl('', [Validators.required]),
      contact_email : new FormControl('', [Validators.required]),
      contact_phone : new FormControl('', [Validators.required]),

      Motor : new FormControl('', [Validators.required]),
      Gate_type : new FormControl('', [Validators.required]),
      Gate_long : new FormControl('', [Validators.required]),
      Gate_heigh : new FormControl('', [Validators.required]),
      Pedestrian_type : new FormControl('', [Validators.required]),
      Pedestrian_long : new FormControl('', [Validators.required]),
      Pedestrian_heigh : new FormControl('', [Validators.required])
      
    });
    
  }

  ngOnInit() {
    // this.SelectDivisionTitle = {header : 'Division', subHeader : 'Select division'};
    this.localWebService = "Y";
    this.getHousing_unit();
  }

  async getHousing_unit(){
    await this.api.getData('api/housing_unit/').subscribe(async result => {
      this.myHousingUnitList = await result;
      console.log('Housing Unit --> ', JSON.stringify(this.myHousingUnitList));
    });

  }

  async changeHousing_unit($event){
    // console.log($event);
    console.log('change Housing Unit --> ' + JSON.stringify($event.value.name))
    this.localhousing_unit = $event.value.id;
    this.myHousingUnitList = $event.value.name;

  }


  async EnableCore($event){
      this.localenable = JSON.stringify($event.detail.checked);
  }

  async onSubmitUpdCoreForm(){
    const pkg = {
      'Name':this.localName,
      'Address':this.localAddress,
      'webService' : this.localWebService,
      'Sim': this.localSim, 
      'Coord' : [this.coordLat, this.coordLon],
      'qty' : this.localHouse_qty,
      'House_detail' : [],
      'housing_unit' : this.localhousing_unit,
      'enable' : this.localenable,
      'contact_name': this.localContact_name,
      'contact_email' : this.localContact_email,
      'contact_phone' : this.localContact_phone,
      'Motor' : this.localMotor,
      'Gate_type': this.localGate_type,
      'Gate_long' : this.localGate_long,
      'Gate_heigh' : this.localGate_heigh,
      'Pedestrian_type': this.localPedestrian_type,
      'Pedestrian_long' : this.localPedestrian_long,
      'Pedestrian_heigh' : this.localPedestrian_heigh

    };
    try{
      await this.api.postRegisterData('api/cores/',pkg);
      this.closeModal();
    }catch(err){
      console.log('can not post core data', err);
    }
  }

  closeModal(){
    this.modalController.dismiss();
  } 
}
