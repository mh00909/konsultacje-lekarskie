import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router, private authService: AuthService) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.authService.getUserRole(user.uid).pipe(
            map(roleData => {
              if (roleData.role === 'doctor') {
                return true; 
              } else {
                this.router.navigate(['/unauthorized']); 
                return false;
              }
            })
          );
        } else {
          this.router.navigate(['/login']);
          return of(false);
        }
      })
    );
  }
  
}
