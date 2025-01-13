import { Injectable } from '@angular/core';
import { DataSource } from './data-source.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseDataService implements DataSource {
  constructor(private firestore: AngularFirestore) {}

  getData(collectionName: string): Observable<any[]> {
    return this.firestore.collection(collectionName).valueChanges({ idField: 'id' }).pipe(take(1));
  }

  addData(collectionName: string, data: any): Observable<any> {
    console.log('Dodawanie danych w FirebaseDataService:', collectionName, data);
    return from(
      this.firestore.collection(collectionName).add(data).then(ref => ({ id: ref.id, ...data }))
    );
  }
  
  removeData(collectionName: string, id: string): Observable<void> {
    console.log(`Usuwanie danych z kolekcji "${collectionName}" o ID: ${id}`);
    return from(
      this.firestore.collection(collectionName).doc(id).delete()
    );
  }

  updateData(collectionName: string, id: string, data: any): Observable<void> {
    console.log(`Aktualizacja danych w kolekcji "${collectionName}" o ID: ${id}`, data);
    return from(
      this.firestore.collection(collectionName).doc(id).update(data)
    );
  }
  

}
