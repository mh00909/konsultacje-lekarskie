import { Observable } from "rxjs";

export interface DataSource {
    getData(collectionName: string): Observable<any[]>;
    addData(collectionName: string, data: any): Observable<any>;
    removeData(collectionName: string, id: string): Observable<void>;
    update(collectionName: string, id: string, data: any): Observable<void>;
  }
  