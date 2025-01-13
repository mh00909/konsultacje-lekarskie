import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, of, switchMap } from 'rxjs';
import { DataSource } from './data-source.interface';
import { DataSourceManagerService } from './data-source-manager.service';
import { v4 as uuidv4 } from 'uuid';


export interface UserData {
  email: string;
  role: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$: Observable<any>;
  private dataSource: DataSource;

  constructor(private afAuth: AngularFireAuth, private dataSourceManager: DataSourceManagerService) {
    this.currentUser$ = this.afAuth.authState;
    this.dataSource = this.dataSourceManager.getDataSource();
    this.dataSourceManager.onDataSourceChange().subscribe(() => {
      this.dataSource = this.dataSourceManager.getDataSource();
    });
  }

  register(email: string, password: string, role: string): Observable<any> {
    const uid = uuidv4(); 
    return this.dataSource.addData('users', { uid, email, password, role });
  }


  logout(): Promise<void> {
    return this.afAuth.signOut();
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser$;
  }

  login(email: string, password: string): Observable<any> {
    return this.dataSource.getData('users').pipe(
      map(users => {
        console.log('Dostępni użytkownicy:', users);
        const user = users.find((u: any) => u.email === email && u.password === password);
        if (!user) {
          throw new Error('Nieprawidłowy email lub hasło');
        }
        return user;
      })
    );
  }
  
  getUserRole(uid: string): Observable<any> {
    return this.dataSource.getData('users').pipe(
      map(users => {
        const user = users.find((u: any) => u.uid === uid);
        if (!user) {
          throw new Error('Nie znaleziono użytkownika');
        }
        return { email: user.email, role: user.role };
      })
    );
  }
}
