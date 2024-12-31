// import { Injectable } from '@angular/core';
// import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class FirestoreService {
//   constructor(private firestore: AngularFirestore) {}

//   getCollectionData(collectionName: string): Observable<any[]> {
//     return this.firestore.collection(collectionName).valueChanges({ idField: 'id' });
//   }

//   addData(collectionName: string, data: any): Promise<DocumentReference<unknown>> {
//     return this.firestore.collection(collectionName).add(data);
//   }

//   async removeData(collectionName: string, docId: string): Promise<void> {
//     return this.firestore.collection(collectionName).doc(docId).delete();
//   }

//   async setData(collectionName: string, docId: string, data: any): Promise<void> {
//     return this.firestore.collection(collectionName).doc(docId).set(data, { merge: true });
//   }
// }
