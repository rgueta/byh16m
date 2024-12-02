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
    const time = Date.now();
    const today  = new Date(time);
    today.setUTCHours(0,0,0).toLocaleString();
    // today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    
    this.filterDay = today.toISOString();
    this.start  = today.toISOString();

  }

  async ionViewWillEnter() {
    this.myUserId = await localStorage.getItem(USERID);
    this.myToken = await localStorage.getItem(TOKEN_KEY);
    this.Core_sim = await localStorage.getItem(CORE_SIM);
  }

<<<<<<< HEAD
  async getEvents_($event:any){
    console.log('$event: ', $event)
=======
  async getEvents_(event:any){
>>>>>>> code_events_fix_date_select

    this.start = await new Date( event.detail.value);
    this.end = await new Date( event.detail.value);
    
    this.filterDay = this.start.toISOString();

  }

<<<<<<< HEAD
  async getEvents($event:any){
=======
  async getEvents(event:any){
    this.start = await new Date( event.detail.value);
    this.end = await new Date( event.detail.value);

    await this.start.setHours(0,0,0).toLocaleString();
    await this.end.setHours(23,59,59).toLocaleString();

    const initial = new Date(this.start.getTime() - 
      (this.start.getTimezoneOffset() * 60000)).toISOString();

    const final = new Date(this.end.getTime() - 
      (this.end.getTimezoneOffset() * 60000)).toISOString();

    this.filterDay = initial;
>>>>>>> code_events_fix_date_select

    if(! await this.toolsService.verifyNetStatus()){
      this.toolsService.toastAlert('No hay Acceso a internet',0,['Ok'],'middle');
      return;
    }

<<<<<<< HEAD
    this.start = await new Date($event);
    this.end = await new Date($event);

    await this.start.setHours(0,0,0);
    await this.end.setHours(23,59,59);

    console.log('start: ',this.start.toISOString());
    console.log('end: ',this.end.toISOString());

=======
>>>>>>> code_events_fix_date_select
    // this.start = await Utils.convDate(await 
    //   Utils.convertLocalDateToUTCDate(new Date(this.start)));
    // this.end = await Utils.convDate(await 
    //   Utils.convertLocalDateToUTCDate(new Date(this.end)));



    try{
      await this.api.getData('api/codeEvent/' + 
        this.myUserId + '/' + initial + '/' + final).subscribe(async result =>{
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
