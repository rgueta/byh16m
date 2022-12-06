import { ComponentFactoryResolver, Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, of, Subject } from 'rxjs';
import { environment } from "../../environments/environment";
import { DatabaseService  } from "../services/database.service";
// import { Storage } from "@ionic/storage-angular";
import { Storage } from '@capacitor/core';
// const { Storage } = Plugins;

// ---- added for v2.2
// import { Storage } from "@capacitor/core";
import { Platform } from "@ionic/angular";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { DefaultValueAccessor } from '@angular/forms';

const helper = new JwtHelperService();

const REFRESH_TOKEN_KEY = 'my-refresh-token';
const TOKEN_KEY = 'my-token';
const USERID = 'my-userId';
const USER_ROLES = 'my-roles';
const MY_SIM = 'my-sim';
const CORE_SIM = 'my-core-sim';
const USER_ROLE = 'my-role';
const CORE_NAME = 'core-name';
const LOCATION = 'location';
const TWILIO = 'twilio';
 
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService{
  //#region ---- added for v2.2
  public user: Observable<any>;
  private userData = new BehaviorSubject(null);

  //#endregion

  // Init with null to filter out the first value in a guard!
  private  REST_API_SERVER = environment.db.server_url;
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  currentAccessToken = null;
  userId = '';
  public roles:any;
  constructor(private http: HttpClient, private api: DatabaseService, 
              private router : Router, 
              private plt : Platform) {
    Storage.set({key: TWILIO, value: 'false'});
    this.loadToken();
  }


  // Load accessToken on startup
  async loadToken() {
    // await this.storage.clear().then(async _ => {
    //   await this.storage.create();
    // });

    // await this.storage.create();
    const token = await Storage.get({ key: TOKEN_KEY });
    // let token : any 
    // this.storage.get(TOKEN_KEY).then(val => {
    //   token = val;
    // })
    
    
    if (token && token.value) {
      this.currentAccessToken = token.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  } 

  // Sign in a user and store access and refres token
  login(credentials: {email, pwd}): Observable<any> {
    return this.http.post(`${this.REST_API_SERVER}api/auth/signin`, credentials).pipe(
      switchMap((tokens: {accessToken, refreshToken, userId, roles, sim, core_sim, coreName, location}) => {
        this.currentAccessToken = tokens.accessToken;

        // this.storage.set(USERID,tokens.userId);
        // this.storage.set(USER_ROLES,tokens.roles);
        // this.storage.set(CORE_SIM, tokens.core_sim);
        // const storeAccess = this.storage.set(TOKEN_KEY, tokens.accessToken);
        // const storeRefresh = this.storage.set(REFRESH_TOKEN_KEY, tokens.refreshToken);

        // let roleObj : any;
       
        // this.storage.get('my-roles').then(val => {
        //   roleObj = val.value;
        //   console.table(roleObj);
        // });


        // console.table(tokens.roles);

        this.IsAdmin(tokens.roles).then(val => {
          Storage.set({key: 'IsAdmin', value: val.toString()});
        });

        this.MyRole(tokens.roles).then(val_role => {
          console.log('------------------------   What is my role --> ' + val_role);
          Storage.set({key: 'my-role', value: val_role});
        })
        
        console.log('aws whole login query --> ',tokens)
        Storage.set({key: USERID, value: tokens.userId});
        Storage.set({key: USER_ROLES, value: tokens.roles});
        Storage.set({key: CORE_SIM, value: tokens.core_sim});
        Storage.set({key: MY_SIM, value: tokens.sim});
        Storage.set({key: CORE_NAME, value: tokens.coreName});
        Storage.set({key: LOCATION, value: tokens.location});
        Storage.set({key: TWILIO, value: 'false'});

        const storeAccess = Storage.set({key: TOKEN_KEY, value: tokens.accessToken});
        const storeRefresh = Storage.set({key: REFRESH_TOKEN_KEY, value: tokens.refreshToken});
        return from(Promise.all([storeAccess, storeRefresh]));
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })
    )
  }

  async MyRole(roles){
    //--- check for admin role
    let myrole = '';
    if(await roles.find(role => role.name.toLowerCase() === 'admin')){
      myrole = 'admin'
    }else if(await roles.find(role => role.name.toLowerCase() === 'supervisor')){
      myrole = 'supervisor'
    }else if(await roles.find(role => role.name.toLowerCase() === 'neighbor')){
      myrole = 'neighbor'
    }else if(await roles.find(role => role.name.toLowerCase() === 'relative')){
      myrole = 'relative'
    }else if(await roles.find(role => role.name.toLowerCase() === 'visitor')){
      myrole = 'visitor'
    }

    return await myrole;
  }

  async IsAdmin(roles){
    let myRole = await roles.find(role => role.name.toLowerCase() === 'admin');
    return myRole ? true : false
  }

  getUser(){
    return this.userData.getValue();
  }

  logout() {
    this.isAuthenticated.next(false);
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
  
  // logout_() {
  //   return this.http.post(`${this.REST_API_SERVER}/api/auth/signout`, {}).pipe(
  //     switchMap(_ => {
  //       this.currentAccessToken = null;
  //       // Remove all stored tokens
  //       const deleteAccess = Storage.remove({ key: TOKEN_KEY });
  //       const deleteRefresh = Storage.remove({ key: REFRESH_TOKEN_KEY });
  //       return from(Promise.all([deleteAccess, deleteRefresh]));
  //     }),
  //     tap(_ => {
  //       this.isAuthenticated.next(false);
  //       this.router.navigateByUrl('/', { replaceUrl: true });
  //     })
  //   ).subscribe();
  // }


  // Load the refresh token from storage
// then attach it as the header for one specific API call
getNewAccessToken() {
  const refreshToken = from(Storage.get({ key: REFRESH_TOKEN_KEY }));
  // const refreshToken = from(this.storage.get(REFRESH_TOKEN_KEY));
  return refreshToken.pipe(
    switchMap(token => {
      if (token && token.value) {
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`
          })
        }
        return this.http.get(`${this.REST_API_SERVER}/api/auth/refresh`, httpOptions);
      } else {
        // No stored refresh token
        return of(null);
      }
    })
  );
}

  // Store a new access token
  storeAccessToken(accessToken) {
    this.currentAccessToken = accessToken;
    return from(Storage.set({ key: TOKEN_KEY, value: accessToken }));
    // return from(this.storage.set(TOKEN_KEY, accessToken));
  }
}