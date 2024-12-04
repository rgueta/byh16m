import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import {Utils} from '../tools/tools';
import { ToolsService } from "../services/tools.service";

const USERID = 'my-userId';
const REFRESH_TOKEN_KEY = 'my-refresh-token';
const TOKEN_KEY = 'my-token';
const CORE_SIM = 'my-core-sim';
const netStatus = 'netStatus';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page implements OnInit {
  start: any = new Date();
  end: any = new Date();
  
  public EventsList:any;
  public myEventsList:any;
  automaticClose = false;
  Core_sim : any;
  public Initial : string = '';
  public Final : string = '';
  myToken : any;
  myRefreshToken : any;
  myToast:any;
  myUserId:any;

  constructor(
    public api : DatabaseService,
    private toolsService:ToolsService
  ) { }

  async ngOnInit(): Promise<void> {
    const time = Date.now();
    const today  = new Date(time);
    this.start = today.setUTCHours(0,0,0).toLocaleString();
    this.end = today.setUTCHours(23,59,59).toLocaleString();

    // await this.start.setHours(0,0,0).toLocaleString();
    // await this.end.setHours(23,59,59).toLocaleString();

    // this.Initial = new Date(this.start.getTime() - 
    //   (this.start.getTimezoneOffset() * 60000)).toISOString();

    // this.Final = new Date(this.end.getTime() - 
    //   (this.end.getTimezoneOffset() * 60000)).toISOString();
    
    // this.Initial = this.Final = today.toISOString();
    // this.start  = today.toISOString();


    console.log('--- OnInit ----')
    console.log('Initial: ', this.start);
    console.log('Final: ', this.end);

  }

  async ionViewWillEnter() {
    this.myUserId = await localStorage.getItem(USERID);
    this.myToken = await localStorage.getItem(TOKEN_KEY);
    this.Core_sim = await localStorage.getItem(CORE_SIM);


    const time = Date.now();
    const today  = new Date(time);
    this.start = today.setUTCHours(0,0,0).toLocaleString();
    this.end = today.setUTCHours(23,59,59).toLocaleString();

    // await this.start.setHours(0,0,0).toLocaleString();
    // await this.end.setHours(23,59,59).toLocaleString();

    this.Initial = new Date(this.start.getTime() - 
      (this.start.getTimezoneOffset() * 60000)).toISOString();

    // this.Final = new Date(this.end.getTime() - 
    //   (this.end.getTimezoneOffset() * 60000)).toISOString();
    
    // this.Initial = this.Final = today.toISOString();
    // this.start  = today.toISOString();


    console.log('--- OnInit ----')
    console.log('Initial: ', this.start);
    console.log('Final: ', this.end);
  }



  async getEventsInitial(event:any){
    this.start = await new Date( event.detail.value);
    this.end = await new Date( event.detail.value);

    await this.start.setHours(0,0,0).toLocaleString();
    await this.end.setHours(23,59,59).toLocaleString();

    const initial = new Date(this.start.getTime() - 
      (this.start.getTimezoneOffset() * 60000)).toISOString();

    const final = new Date(this.end.getTime() - 
      (this.end.getTimezoneOffset() * 60000)).toISOString();

    this.Initial = initial;

    console.log('Initial: ', this.Initial);
    console.log('Final: ', this.Final);


    if(! await this.toolsService.verifyNetStatus()){
      this.toolsService.toastAlert('No hay Acceso a internet',0,['Ok'],'middle');
      return;
    }

  }

  async getEventsFinal(event:any){

    this.end = await new Date( event.detail.value);
    
    this.Final = this.start.toISOString();

    console.log('Initial: ', this.Initial)
    console.log('Final: ', this.Final)

  }

  async getEvents(){
    console.log('Buscar!')
    console.log('Initial: ', this.Initial);
    console.log('Final: ', this.Final);
  }


  async getEvents_(){
    
    try{
      await this.api.getData('api/codeEvent/' + 
        this.myUserId + '/' + this.Initial + '/' + this.Final).subscribe(async result =>{
        console.log('events -->', result)
        this.EventsList = await result;
      
        if(this.EventsList.length > 0){
          this.EventsList.forEach(async (item:any) =>{
            let d = new Date(item.createdAt.replace('Z',''));
            item.createdAt = await new Date(d.setMinutes(d.getMinutes() 
            - d.getTimezoneOffset()));
          });

        this.EventsList[0].open = true;
        }else{
          this.toolsService.toastAlert('No hay eventos para esta fecha',0,['Ok'],'middle')
        }
    
      });
    }catch(e){
      this.toolsService.showAlertBasic('Aviso','Ocurrio una excepción revisar:',
      `1. Acceso a la red<br>` +
      `2. Permiso para envio de sms`,['Cerrar']);

    }
  }

  async setupCode(visitorId:string){
    
  }

  async doRefresh(event:any) {
    this.EventsList = null;
    this.getEventsFinal(this.start);
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }


  toggleSection(index:any){
    this.EventsList[index].open = !this.EventsList[index].open;
    if(this.automaticClose && this.EventsList[index].open){
      this.EventsList
      .filter((item:{}, itemIndex:number) => itemIndex != index)
      .map((item:any) => item.open = false);
    }
  }

}
