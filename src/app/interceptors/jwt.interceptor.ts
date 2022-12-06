import { environment } from "../../environments/environment";
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { DatabaseService } from '../services/database.service';
import { Router } from "@angular/router";
import {
  catchError,
  finalize,
  switchMap,
  filter,
  take,
} from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
 
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Used for queued API calls while refreshing tokens
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  isRefreshingToken = false;

  REST_API_SERVER = environment.db.server_url;

  constructor(private apiService: DatabaseService, private toastCtrl: ToastController, private router : Router) { }
 
  // Intercept every HTTP call
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('----------  INTERCEPTOR ...!  -------------------');
    // Check if we need additional token logic or not
    console.log('interceptor intercept isInBlockedList --> ',this.isInBlockedList(request.url));

    if (this.isInBlockedList(request.url)) {
      return next.handle(request);
    } else {
      return next.handle(this.addToken(request)).pipe(
        catchError(err => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 400:
                console.log('---------- 400  INTERCEPTOR  logout the user  -------------------');
                return this.handle400Error(err);
              case 401:
                console.log('---------- 401  INTERCEPTOR  token expire start token refresh  -------------------');
                return this.handle401Error(request, next);
              default:
                console.log('---------- default status not (400,401)  INTERCEPTOR  ...!  -------------------');
                return throwError(err);
            }
          } else {
            return throwError(err);
          }
        })
      );
    }
  }

  // Filter out URLs where you don't want to add the token!
  private isInBlockedList(url: String): Boolean {
    // console.log('isInBlockedList URL calling  -- > ', url)
    // console.log('isInBlockedList indexOf calling', `${this.REST_API_SERVER}api/pwdResetReq`);
    // Example: Filter out our login and logout API call
    // if (url == `${this.REST_API_SERVER}api/auth/signin` ||
    //   url == `${this.REST_API_SERVER}api/auth/signup` || 
    //   url.indexOf(`${this.REST_API_SERVER}'api/pwdResetReq`) ) {
      if (url == `${this.REST_API_SERVER}api/auth/signin` ||
        url == `${this.REST_API_SERVER}api/auth/signup` || 
        url == `${this.REST_API_SERVER}api/pwdResetReq` ||
        url == `${this.REST_API_SERVER}api/users/register/`) {
        console.log('URL calling bilongs to blocked list -- > ', url);
      return true;
    } else {
      return false;
    }
  }

    // Add our current access token from the service if present
    private addToken(req: HttpRequest<any>) {
      console.log('interceptor addToken currentAccessToken--> ',
      this.apiService.currentAccessToken);

      if (this.apiService.currentAccessToken) {
        return req.clone({
          headers: new HttpHeaders({
            Authorization: `Bearer ${this.apiService.currentAccessToken}`
          })
        });
      } else {
        return req;
      }
    }
 


  // We are not just authorized, we couldn't refresh token
// or something else along the caching went wrong!
private async handle400Error(err) {
    // Potentially check the exact error reason for the 400
    // then log out the user automatically
    const toast = await this.toastCtrl.create({
      message: 'Logged out due to authentication mismatch',
      duration: 3000
    });
    toast.present();
    this.apiService.logout();
    // this.router.navigateByUrl('/', { replaceUrl: true });
    return of(null);
  }


    // Indicates our access token is invalid, try to load a new one
private handle401Error(request: HttpRequest < any >, next: HttpHandler): Observable < any > {
  console.log('<--- inside jwt.interceptor handle401Error --- > ');
  // Check if another call is already using the refresh logic
  if(!this.isRefreshingToken) {

    // Set to null so other requests will wait
    // until we got a new token!
    this.tokenSubject.next(null);
    this.isRefreshingToken = true;
    this.apiService.currentAccessToken = null;

    console.log(' jwt.interceptor handle401Error --- > ');
    // First, get a new access token
    return this.apiService.getNewAccessToken().pipe(
      switchMap((token: any) => {
        if (token) {
          // Store the new token
          const accessToken = token.accessToken;
          return this.apiService.storeAccessToken(accessToken).pipe(
            switchMap(_ => {
              // Use the subject so other calls can continue with the new token
              this.tokenSubject.next(accessToken);

              // Perform the initial request again with the new token
              return next.handle(this.addToken(request));
            })
          );
        } else {
          // No new token or other problem occurred
          return of(null);
        }
      }),
      finalize(() => {
        // Unblock the token reload logic when everything is done
        this.isRefreshingToken = false;
      })
    );
  } else {
    // "Queue" other calls while we load a new token
    return this.tokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(_ => {
      // switchMap(token => {
        // Perform the request again now that we got a new token!
        return next.handle(this.addToken(request));
      })
    );
  }
}
  
}