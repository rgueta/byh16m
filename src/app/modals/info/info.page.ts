import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from "@ionic/angular";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { DatabaseService } from "../../services/database.service";
import { environment } from "../../../environments/environment";
import { Validators, FormControl, FormBuilder, FormGroup} from "@angular/forms";
import { finalize, lastValueFrom } from 'rxjs';
import { HttpClient } from "@angular/common/http";

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
  image : any;

  REST_API_SERVER = environment.cloud.server_url;

  constructor(
    private modalController : ModalController,
    public loadingCtrl: LoadingController,
    public toast: ToastController,
    private api : DatabaseService,
    // public formBuilder : FormBuilder
    private http: HttpClient
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

  async getImage(){
    try{
      this.localImg = await Camera.getPhoto({
        quality:30,
        allowEditing:false,
        resultType:CameraResultType.DataUrl,
        source:CameraSource.Photos
      });

      if(this.localImg){
        // console.log('image -> ',this.localImg);
        this.imageFileName = Capacitor.convertFileSrc(this.localImg.dataUrl);
        this.localDescription = 'Description';
        this.localUrl = 'Local Url';

        console.log('this.imageFileName --> ', this.imageFileName);
        console.log('this.localDescription --> ', this.localDescription);
        console.log('this.localUri --> ', this.localUrl);
      }
    }catch(e){
      console.log('Error getImage: ', e);
    }
  }

  async uploadFile() {
    this.image = this.localImg.dataUrl;
    const blob = this.dataURLtoBlob(this.localImg.dataUrl);
    var imageFile = new File([blob], 'profile.jpg', {type: 'image/jpg'});


    console.log('imageFile --> ',blob);

    let formData = new FormData();
    formData.append('image', blob, 'profile.jpg');
    
    const loading = await this.loadingCtrl.create({
      message: 'Uploading image... ',
    });


    
    let params:{} = {'userId': this.userId,'title': this.localTitle, 'url' : this.localUrl, 
          'description' : this.localDescription, 'locationFolder': this.imgFolder}

    // use your own API
    // this.api.postDataInfo("api/info", formData, params ).then(async resp =>{
    //     console.log('resp --> ', resp);
    //   });

    let  options = {
      headers : {
        'content-type' : 'application/json'
        },
      params: params
    }

    const data$ = await this.http.post<any>(this.REST_API_SERVER + 'api/info/' + this.userId, formData, options);
    // const data$ = await this.http.post<any>(this.REST_API_SERVER + 'api/info', formData);
    const res = await lastValueFrom(data$);

    console.log(res)

  }

  async uploadFile_() {
    const response = await fetch(this.localImg);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('image', blob, this.imageFileName);

    this.uploadData(formData);
  }

  async uploadData(formData: FormData){
    const loading = await this.loadingCtrl.create({
      message: 'Uploading image... ',
    });

    let params:{} = {'userId': this.userId,'title': this.localTitle, 'url' : this.localUrl, 
          'description' : this.localDescription, 'locationFolder': this.imgFolder}

    // let params:{} = {'userId': this.userId}

    // use your own API
    this.api.postDataInfo("api/info", formData, params ).then(async resp =>{
        console.log('resp --> ', resp);
      });

  }

  dataURLtoBlob(dataurl:any){
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime});
  }


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
