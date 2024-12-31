import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$: Observable<any>;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    this.currentUser$ = this.afAuth.authState;
  }

  register(email: string, password: string): Promise<any> {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  login(email: string, password: string): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  logout(): Promise<void> {
    return this.afAuth.signOut();
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser$;
  }

  addUserToFirestore(uid: string, email: string, role: string): Promise<void> {
    return this.firestore.collection('users').doc(uid).set({
      email: email,
      role: role
    });
  }

  getUserRole(uid: string): Observable<any> {
    return this.firestore.collection('users').doc(uid).valueChanges().pipe(
      map(data => {
        if (!data || typeof data !== 'object' || !('role' in data)) {
          throw new Error('Brak pola "role" w danych użytkownika.');
        }
        
        return data;
      })
    );
  }
  
  
  isRole(role: string): Observable<boolean> {
    return this.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          return this.getUserRole(user.uid).pipe(
            map((roleData: { role: string; }) => roleData.role === role)
          );
        }
        return of(false);
      })
    );
  }
  
}
