import { Injectable } from '@angular/core';
import { DataSource } from './data-source.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDataService implements DataSource {
  constructor(private firestore: AngularFirestore) {}

  getData(collectionName: string): Observable<any[]> {
    return this.firestore.collection(collectionName).valueChanges({ idField: 'id' });
  }

  addData(collectionName: string, data: any): Observable<any> {
    return new Observable(observer => {
      this.firestore.collection(collectionName).add(data).then(ref => {
        observer.next({ id: ref.id, ...data });
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }

  removeData(collectionName: string, id: string): Observable<void> {
    return new Observable(observer => {
      this.firestore.collection(collectionName).doc(id).delete().then(() => {
        observer.next();
        observer.complete();
      }).catch(err => observer.error(err));
    });
  }
}
