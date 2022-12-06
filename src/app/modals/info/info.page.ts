import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from "@ionic/angular";
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Storage,Capacitor } from "@capacitor/core";
import { DatabaseService } from "../../services/database.service";
import { environment } from "../../../environments/environment";
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";

const USERID = 'my-userId';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {
  RegisterForm : FormGroup;
  imageURI:any;
  imageFileName:any;
  myToast:any;
  userId = {};
  localTitle : String;
  localDescription : String;
  localUrl : String;
  localCountry : String;
  localState : String;
  localCity : String;
  localDivision : String;
  localCpu : String;
  localCore : String;
  
  public countriesList : any;
  public statesList : any ;
  public citiesList : any;
  public divisionsList : any;
  public cpusList : any;
  public coresList : any;
  public imgFolder : String;
  public localInfo:any;

  REST_API_SERVER = environment.db.server_url;

  constructor(
    private modalController : ModalController,
    private transfer: FileTransfer,
    private camera: Camera,
    public loadingCtrl: LoadingController,
    public toast: ToastController,
    private api : DatabaseService,
    // public formBuilder : FormBuilder
    ) {

      this.RegisterForm = new FormGroup({
        frmCtrl_country : new FormControl('', [Validators.required]),
        frmCtrl_state : new FormControl('', [Validators.required]),
        frmCtrl_city : new FormControl('', [Validators.required]),
        frmCtrl_division : new FormControl('', [Validators.required]),
        frmCtrl_cpu : new FormControl('', [Validators.required]),
        frmCtrl_core : new FormControl('', [Validators.required])
      });
     }

   

  async ngOnInit() {
    this.localTitle = 'Aqui va el titulo..';
    await Storage.get({key : 'my-userId'}).then(val_userId => {
      this.userId = val_userId.value;
    });

    this.collectCountries();
    this.collectInfo();
  }


  
//#region select location  -------------------------------------------
  async collectCountries(){
    await this.api.getData('api/countries/').subscribe(async countriesResult =>{
      this.countriesList = await countriesResult;
    });
  }

  async collectStates(country){
    await this.api.getData('api/states/' + country).subscribe(async statesResult =>{
      this.statesList = await statesResult;

    })
  }

  async collectCities(state){
    await this.api.getData('api/cities/' + this.localCountry +',' + state).subscribe(async citiesResult =>{
      this.citiesList = await citiesResult;
    })
  }

  async collectDivisions(city){
    await this.api.getData('api/divisions/'  
      + this.localCountry +',' + this.localState + ',' + city).subscribe(async divisionsResult =>{
      this.divisionsList = await divisionsResult;
    })
  }

  async collectCpus(division){
    await this.api.getData('api/cpus/'
    + this.localCountry +',' + this.localState + ',' 
    + this.localCity + ',' + parseInt(division)).subscribe(async cpusResult =>{
      this.cpusList = await cpusResult;
    })
  }
  async collectCores(cpu){
    await this.api.getData('api/cores/light/'
    + this.localCountry +',' + this.localState + ',' + this.localCity + ',' 
    + this.localDivision + ',' + cpu).subscribe(async coresResult =>{
      this.coresList = await coresResult;
    })
  }

 

  async countrySelection(country){
    // let countryObj = this.RegisterForm.controls['frmCtrl_country'].value
    this.collectStates(country);
    // this.localCountry = countryObj.name;
    this.localCountry = country;
  }

  async stateSelection(state){
    this.collectCities(state);
    this.localState = state;
    
  }

  async citySelection(city){
    this.collectDivisions(city[0]);
    this.localCity = city[0];
  }

  async divisionSelection(division){
    await this.collectCpus(division[0]);
    this.localDivision = await division[0];
  }

  async cpuSelection(cpu){
    await this.collectCores(cpu);
    this.localCpu = await cpu;
  }

  async coreSelection(core){

    this.localCore = core;
    this.imgFolder = this.localCountry + '.' + this.localState + '.' + this.localCity + '.'
      + this.localDivision + '.' + this.localCpu + '.' + this.localCore
    console.log('img Folder --> ', this.imgFolder);
  }

  //#endregion select location  -------------------------------------------


//#region Image section ------------------------------------------------

  async getImage() {
    const options: CameraOptions = {
      quality: 50,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.FILE_URI,
    }
  
    await this.camera.getPicture(options).then(async (imageData) => {
      this.imageURI = imageData;
      this.imageFileName = Capacitor.convertFileSrc(imageData);
      this.localUrl = String(this.imageFileName);
      this.localDescription = String(this.imageFileName);
    }, (err) => {
      console.log('Error --> ',err);
      this.toastEvent(err);
    });
  }

  async uploadFile() {
    let loader = await this.loadingCtrl.create({
      message: "Uploading...",
      duration: 4000,
      cssClass:'loader-css-class',
      backdropDismiss:true
    }).then(res => {
      res.present();
      res.onDidDismiss().then((response) => {
        console.log('Loader dismissed', response);
      });

      setTimeout(() =>{
        this.loadingCtrl.dismiss();
      },5000);
    });

    
    const fileTransfer: FileTransferObject = this.transfer.create();

    let options: FileUploadOptions = {
      fileKey: 'image',
      // fileName: 'image.jpg',
      chunkedMode: false,
      // mimeType: "multipart/form-data",
      mimeType: "image/jpeg",
      params:{'title': this.localTitle, 'url' : this.localUrl, 
        'description' : this.localDescription, 'locationFolder': this.imgFolder},
      headers: {}
    };
    //'http://192.168.1.173:5000/api/info/' 

    // console.log('Image path --> ', this.REST_API_SERVER + "api/info/" +
    // this.userId)

    console.log('Image options params', options.params)
    
    fileTransfer.upload(this.imageURI, this.REST_API_SERVER + "api/info/" +
      this.userId, options)
      .then((data) => {
      setTimeout(() =>{
        
      })
      this.toastEvent("Image uploaded successfully");
    }, (err) => {
      console.log(err);
      // loader.dismiss();
      this.toastEvent(err);
    });

  }

  //#endregion Image section ------------------------------------------------
  async collectInfo(){
    await this.api.getData('api/info/all/' + this.userId).subscribe(async result => {
       this.localInfo = await result;
     });
   }

  async doRefresh(event){
    this.collectInfo();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async StatusInfo(event,status,infoId){
    try{

      if(event.detail.checked && status){ //Show
        await this.api.postData('api/info/updStatus/' + 
          this.userId + '/' + infoId,{'disable':false}).then(async result => {
            console.log('StatusInfo result -->',result);
            // this.toastEvent("Info updated successfully");
            // await this.collectInfo();
            setTimeout(async () => {
              await this.collectInfo();
            }, 2000);
          });
      }else if(event.detail.checked && !status){ // Hide
        await this.api.postData('api/info/updStatus/' + 
          this.userId + '/' + infoId,{'disable':true}).then(async()=>{
            // this.toastEvent("Info updated successfully");
            // await this.collectInfo();
            setTimeout(async () => {
              await this.collectInfo();
            }, 2000);
          });
          
      } 


     
   }catch(e){
    
   }
  }

  async cancelUploadFile(){
    this.imageFileName = '';
  }

  // -------   toast control alerts    ---------------------
  toastEvent(msg){
    this.myToast = this.toast.create({
      message:msg,
      duration:6000
    }).then((toastData) =>{
      console.log(toastData);
      toastData.present();
    });
  }

  closeModal(){
    this.modalController.dismiss();
  }

}
