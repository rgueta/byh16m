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
  public filterDay : string = '';
  myToken : any;
  myRefreshToken : any;
  myToast:any;
  myUserId:any;

  constructor(
    public api : DatabaseService,
    private toolsService:ToolsService
  ) { }

  async ngOnInit(): Promise<void> {
  }


  async ionViewWillEnter() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    this.start = today.toISOString();
    this.filterDay = today.toISOString();
    this.myUserId = await localStorage.getItem(USERID);
    this.myToken = await localStorage.getItem(TOKEN_KEY);
    this.Core_sim = await localStorage.getItem(CORE_SIM);

    // this.getEvents();
  }

  async getEvents($event:any){

    if(! await this.toolsService.verifyNetStatus()){
      this.toolsService.toastAlert('No hay Acceso a internet',0,['Ok'],'middle');
      return;
    }

    this.start = await new Date($event);
    this.end = await new Date($event);
    await this.start.setHours(0,0,0,0);
    await this.end.setHours(23,59,59,0);

    this.start = await Utils.convDate(this.start);
    this.end = await Utils.convDate(this.end);

    try{
      await this.api.getData('api/codeEvent/' + 
        this.myUserId + '/' + this.Core_sim + 
        '/' + this.start + '/' + 
        this.end).subscribe(async result =>{
      
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
    this.getEvents(this.start);
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
