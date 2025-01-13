import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataSource } from './data-source.interface';

@Injectable({
  providedIn: 'root',
})
export class LocalJsonService implements DataSource {
  private baseUrl = 'http://localhost:3001'; 

  constructor(private http: HttpClient) {}

  getData(collectionName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${collectionName}`);
  }

  addData(collectionName: string, data: any): Observable<any> {
    console.log('Dodawanie danych w LocalJsonService:', collectionName, data);
    return this.http.post<any>(`${this.baseUrl}/${collectionName}`, data);
  }

  removeData(collectionName: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${collectionName}/${id}`);
  }
}
