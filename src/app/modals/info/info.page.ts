import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from "@ionic/angular";
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
// import { File } from '@ionic-native/file/ngx';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { DatabaseService } from "../../services/database.service";
import { environment } from "../../../environments/environment";
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";
import { finalize } from 'rxjs';

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
  userId : string;
  localTitle : String;
  localDescription : String;
  localUrl : String;
  localCountry : String;
  public localState : String;
  public localCity : String;
  public localDivision : String;
  public localCpu : String;
  public localCore : String;
  
  public countriesList : any;
  public statesList : any ;
  public citiesList : any;
  public divisionsList : any;
  public cpusList : any;
  public coresList : any;
  public imgFolder : String;
  public localInfo:any;

  localImg : any;

  REST_API_SERVER = environment.cloud.server_url;

  constructor(
    private modalController : ModalController,
    // private transfer: FileTransfer,
    // private camera: Camera,
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
    this.userId = localStorage.getItem('my-userId');
    // await localStorage.getItem('my-userId').then((val_userId:any) => {
    //   this.userId = val_userId.value;
    // });

    this.collectCountries();
    this.collectInfo();
  }


  
//#region select location  -------------------------------------------
  async collectCountries(){
    await this.api.getData('api/countries/' + this.userId).subscribe(async countriesResult =>{
      this.countriesList = await countriesResult;
    });
  }

  async collectStates(country:any){
    await this.api.getData('api/states/' + country + '/' + this.userId).subscribe(async statesResult =>{
      this.statesList = await statesResult;

    })
  }

  async collectCities(state:any){
    await this.api.getData('api/cities/' + 
      this.localCountry + '/' + state + '/' + this.userId).subscribe(async citiesResult =>{
      this.citiesList = await citiesResult;
    })
  }

  async collectDivisions(city:any){
    await this.api.getData('api/divisions/'  
      + this.localCountry + '/' + this.localState + '/' + city + '/' + this.userId).subscribe(async divisionsResult =>{
      this.divisionsList = await divisionsResult;
    })
  }

  async collectCpus(division:any){
    await this.api.getData('api/cpus/basic/'
    + this.localCountry + '/' + this.localState + '/' 
    + this.localCity + '/' + parseInt(division) + '/' + this.userId).subscribe(async cpusResult =>{
      this.cpusList = await cpusResult;
    })
  }
  async collectCores(cpu:any){
    await this.api.getData('api/cores/light/'
    + this.localCountry + '/' + this.localState + '/' + this.localCity + '/' 
    + this.localDivision + '/' + cpu + '/' + this.userId).subscribe(async coresResult =>{
      this.coresList = await coresResult;
    })
  }

 

  async countrySelection(country:any){
    // let countryObj = this.RegisterForm.controls['frmCtrl_country'].value
    this.collectStates(country);
    // this.localCountry = countryObj.name;
    this.localCountry = country;
  }

  async stateSelection(state:any){
    this.collectCities(state);
    this.localState = state;
    
  }

  async citySelection(city:any){
    this.collectDivisions(city[0]);
    this.localCity = city[0];
  }

  async divisionSelection(division:any){
    await this.collectCpus(division[0]);
    this.localDivision = await division[0];
  }

  async cpuSelection(cpu:any){
    await this.collectCores(cpu);
    this.localCpu = await cpu;
  }

  async coreSelection(core:any){

    this.localCore = core;
    this.imgFolder = this.localCountry + '.' + this.localState + '.' + this.localCity + '.'
      + this.localDivision + '.' + this.localCpu + '.' + this.localCore
  }

  //#endregion select location  -------------------------------------------


//#region Image section ------------------------------------------------

  // async getImage() {
  //   const options: CameraOptions = {
  //     quality: 50,
  //     mediaType: this.camera.MediaType.PICTURE,
  //     sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     destinationType: this.camera.DestinationType.FILE_URI,
  //   }
  
  //   await this.camera.getPicture(options).then(async (imageData) => {
  //     this.imageURI = imageData;
  //     this.imageFileName = Capacitor.convertFileSrc(imageData);
  //     this.localUrl = String(this.imageFileName);
  //     this.localDescription = String(this.imageFileName);
  //   }, (err) => {
  //     console.log('Error --> ',err);
  //     this.toastEvent(err);
  //   });
  // }

  async getImage(){
    try{
      this.localImg = await Camera.getPhoto({
        quality:50,
        allowEditing:false,
        resultType:CameraResultType.Uri,
        source:CameraSource.Photos
      });

      if(this.localImg){
        console.log('image -> ',this.localImg);
        this.imageFileName = Capacitor.convertFileSrc(this.localImg.path);
        this.localDescription = String(this.imageFileName);
        this.localUrl = String(this.imageFileName);
      }


    }catch(e){
      console.log('Error getImage: ', e);
    }
  }

  async uploadFile() {
    const response = await fetch(this.localImg);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, this.localImg);
    this.uploadData(formData);
  }

  async uploadData(formData: FormData){
    const loading = await this.loadingCtrl.create({
      message: 'Uploading image... ',
    });

    // use your own API
    this.api.postFile("api/info/" + 
      this.userId, formData ).then(async resp =>{
        console.log('resp --> ', resp);
      });

  }

  // async uploadFile() {
  //   let loader = await this.loadingCtrl.create({
  //     message: "Uploading...",
  //     duration: 4000,
  //     cssClass:'loader-css-class',
  //     backdropDismiss:true
  //   }).then(res => {
  //     res.present();
  //     res.onDidDismiss().then((response) => {
  //       console.log('Loader dismissed', response);
  //     });

  //     setTimeout(() =>{
  //       this.loadingCtrl.dismiss();
  //     },5000);
  //   });

    
  //   const fileTransfer: FileTransferObject = this.transfer.create();

  //   let options: FileUploadOptions = {
  //     fileKey: 'image',
  //     // fileName: 'image.jpg',
  //     chunkedMode: false,
  //     // mimeType: "multipart/form-data",
  //     mimeType: "image/jpeg",
  //     params:{'title': this.localTitle, 'url' : this.localUrl, 
  //       'description' : this.localDescription, 'locationFolder': this.imgFolder},
  //     headers: {}
  //   };
  //   //'http://192.168.1.173:5000/api/info/' 

  //   // console.log('Image path --> ', this.REST_API_SERVER + "api/info/" +
  //   // this.userId)

  //   console.log('Image options params', options.params)
    
  //   fileTransfer.upload(this.imageURI, this.REST_API_SERVER + "api/info/" +
  //     this.userId, options)
  //     .then((data) => {
  //     setTimeout(() =>{
        
  //     })
  //     this.toastEvent("Image uploaded successfully");
  //   }, (err) => {
  //     console.log(err);
  //     // loader.dismiss();
  //     this.toastEvent(err);
  //   });

  // }

  //#endregion Image section ------------------------------------------------
  async collectInfo(){
    await this.api.getData('api/info/all/' + this.userId).subscribe(async result => {
       this.localInfo = await result;
     });
   }

  async doRefresh(event:any){
    this.collectInfo();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async StatusInfo(event:any,status:any,infoId:any){
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
  toastEvent(msg:any){
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
