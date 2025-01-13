import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, Observable, of, switchMap } from 'rxjs';
import { AuthService, UserData } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const allowedRoles: string[] = route.data['roles'] || [];
    const localUser = localStorage.getItem('user');
    console.log('Dozwolone role dla trasy:', allowedRoles);
  
    if (localUser) {
      const user = JSON.parse(localUser);
      console.log('Zalogowany użytkownik (localStorage):', user);
      if (allowedRoles.includes(user.role)) {
        return of(true);
      } else {
        this.router.navigate(['/unauthorized']);
        return of(false);
      }
    } else {
      console.log('Użytkownik niezalogowany');
      this.router.navigate(['/login']);
      return of(false);
    }
  }
  
}
