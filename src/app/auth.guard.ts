import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const allowedRoles: string[] = route.data['roles'] || [];
    const localUser = localStorage.getItem('user');

    if (localUser) {
      const user = JSON.parse(localUser);
      if (allowedRoles.includes(user.role)) {
        return of(true); 
      } else {
        this.router.navigate(['/unauthorized']); 
        return of(false);
      }
    } else {
      return new Observable(observer => {
        this.afAuth.authState.subscribe(user => {
          if (user) {
            observer.next(true);
          } else {
            this.router.navigate(['/login']);
            observer.next(false);
          }
          observer.complete();
        });
      });
    }
  }
}
