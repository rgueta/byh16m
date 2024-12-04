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
  start: any;
  end: any;
  
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
    this.convertDate('Oninit',new Date(Date.now()))
  }

  async ionViewWillEnter() {
    this.myUserId = await localStorage.getItem(USERID);
    this.myToken = await localStorage.getItem(TOKEN_KEY);
    this.Core_sim = await localStorage.getItem(CORE_SIM);
  }

  async getEventsInitial(event:any){

    await this.convertDate('initial',new Date(event.detail.value));

  }

  async getEventsFinal(event:any){

    await this.convertDate('final',new Date(event.detail.value));

  }


  async convertDate(pos:string, fecha:Date){

    if(pos == 'initial'){
      this.start = fecha;
    }else if(pos == 'final'){
      this.end = fecha;
    }else{
      this.start = this.end = fecha;
    }

    if(this.end < this.start){
      const temp = await  this.start;
      this.start = await this.end;
      this.end = await temp;
    }

    await this.start.setHours(0,0,0).toLocaleString();
    await this.end.setHours(23,59,59).toLocaleString();

    this.Initial = new Date(this.start.getTime() - 
    (this.start.getTimezoneOffset() * 60000)).toISOString();
    
    this.Final =  new Date(this.end.getTime() - 
        (this.end.getTimezoneOffset() * 60000)).toISOString();

  }

  async getEvents(){

    if(! await this.toolsService.verifyNetStatus()){
      this.toolsService.toastAlert('No hay Acceso a internet',0,['Ok'],'middle');
      return;
    }
    
    try{
      await this.api.getData('api/codeEvent/' + 
        this.myUserId + '/' + this.Initial + '/' + this.Final).subscribe(async result =>{
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
