import { AuthenticationService } from './../services/authentication.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree,CanActivate, CanLoad, Router, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AlertController } from "@ionic/angular";
 
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthenticationService, 
              private router: Router,
              private alertCtrl : AlertController) { }



  canActivate(): Observable<boolean> {    
    return this.authService.isAuthenticated.pipe(
      filter(val => val !== null), // Filter out initial Behaviour subject value
      take(1), // Otherwise the Observable doesn't complete!
      map(isAuthenticated => {
        if (isAuthenticated) {          
          return true;
        } else {          
          this.router.navigateByUrl('/')
          return false;
        }
      })
    );
  }
            

  canActivate_(route: ActivatedRouteSnapshot): Observable<boolean>{
    return this.authService.user.pipe(
      take(1),
      map(user =>{
        if(!user){
          this.alertCtrl.create({
            header: 'Unauthorized',
            message: 'You are not allowed to access that page',
            buttons: ['OK']
          }).then(alert => alert.present());
          this.router.navigateByUrl('/');
          return false;
        }else{
          return true;
        }
      })
    )
  }
 
  // canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {    
  //   return this.authService.isAuthenticated.pipe(
  //     filter(val => val !== null), // Filter out initial Behaviour subject value
  //     take(1), // Otherwise the Observable doesn't complete!
  //     map(isAuthenticated => {
  //       if (isAuthenticated) {    
  //         console.log('canActivate is true...!!');         
  //         return true;
  //       } else {       
  //         console.log('Sent me to login again...!!');   
  //         this.router.navigateByUrl('/')
  //         return false;
  //       }
  //     })
  //   );
  // }
}