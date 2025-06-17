import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";
import { DatabaseService } from '../../services/database.service';

@Component({
    selector: 'app-upd-cores',
    templateUrl: './upd-cores.page.html',
    styleUrls: ['./upd-cores.page.scss'],
    standalone: false
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
  localLat:any;
  localLon:any;

  // ----- detail  -------
  localMotor : any;
  localGate_type : any;
  localGate_long : any;
  localGate_height : any;
  localPedestrian_type : any;
  localPedestrian_long : any;
  localPedestrian_height : any;
  localhousing_unit :any;
  localenable : any;
  // --- contact  -------
  localContact_name : any;
  localContact_email : any;
  localContact_phone : any;

  public SelectHousingUnitTitle : any = 'Housing unit';
  public myHousingUnitList:any;
  location:any;
  userId : string = '';
  refresh_page: boolean= false;

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
      Gate_height : new FormControl('', [Validators.required]),
      Pedestrian_type : new FormControl('', [Validators.required]),
      Pedestrian_long : new FormControl('', [Validators.required]),
      Pedestrian_height : new FormControl('', [Validators.required])
      
    });
    
  }

  async ngOnInit() {
    this.userId = localStorage.getItem('my-userId');
    this.location  = await localStorage.getItem('location')
    
    var locationArr = this.location.split('.');
    console.log('location Array --> ', locationArr);
    this.localWebService = "Y";
    this.getCpus(locationArr);
  }

  async getCpus(location:any){
    await this.api.getData('api/cpus/basic/' + location[0] + ',' + location[1] + ',' + location[2] + ',' + location[3]).subscribe(async result => {
      this.myHousingUnitList = await result;
      console.log('Housing Unit --> ', JSON.stringify(this.myHousingUnitList));
    });

  }

  async changeHousing_unit($event:any){
    // console.log($event);
    console.log('change Housing Unit --> ' + JSON.stringify($event));
    // this.localhousing_unit = $event.value.id;
    // this.myHousingUnitList = $event.value.name;

  }


  async EnableCore($event:any){
      this.localenable = JSON.stringify($event.detail.checked);
  }


  async onSubmitUpdCoreForm(){
    const pkg = {
      'name': 'test',
      'Address': 'Test Address',
      'webService' : true,
      'Sim': '6641752182', 
      'coord' : ['24', '22.3'],
      'qty' : 28,
      'House_detail' : [] = [],
      'housing_unit' : '6423087c02cc48ae02388186',
      'enable' : true,
      'contact_name': 'rjg',
      'contact_email' : 'test@test.com',
      'contact_phone' : '6641752182',
      'Motor' : 'Motor 123',
      'Gate_type': 'gate type',
      'Gate_long' : 6,
      'Gate_height' : 3,
      'Pedestrian_type': 'tubes',
      'Pedestrian_long' : 1.2,
      'Pedestrian_height' : 2

    };
    try{

      await this.api.postRegisterData('api/cores/' + this.userId ,pkg).then(async result =>{
        console.log('response --> ', result)
        await this.closeModal(true);
      },async error => {
        alert('Failed to add core');
        await this.closeModal(false);
      });
      
      
    }catch(err){
      console.log('can not post core data', err);
    }
  }

  async onSubmitUpdCoreForm_(){
    const pkg = {
      'Name':this.localName,
      'Address':this.localAddress,
      'webService' : this.localWebService,
      'Sim': this.localSim, 
      'Coord' : [this.coordLat, this.coordLon],
      'qty' : this.localHouse_qty,
      'House_detail' : [] = [],
      'housing_unit' : this.localhousing_unit,
      'enable' : this.localenable,
      'contact_name': this.localContact_name,
      'contact_email' : this.localContact_email,
      'contact_phone' : this.localContact_phone,
      'Motor' : this.localMotor,
      'Gate_type': this.localGate_type,
      'Gate_long' : this.localGate_long,
      'Gate_height' : this.localGate_height,
      'Pedestrian_type': this.localPedestrian_type,
      'Pedestrian_long' : this.localPedestrian_long,
      'Pedestrian_height' : this.localPedestrian_height

    };
    try{
      await this.api.postRegisterData('api/cores/',pkg);
      this.closeModal(true);
    }catch(err){
      console.log('can not post core data', err);
      this.closeModal(false);
    }
  }

  async closeModal(refresh:Boolean){
   await this.modalController.dismiss(refresh);
  }

}
