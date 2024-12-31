import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment.prod';
import { DataSource } from './data-source.interface';
import { LocalJsonService } from './local-json.service';
import { FirebaseDataService } from './firebase-data.service';

@Injectable({
  providedIn: 'root'
})
export class DataSourceManagerService {
  private currentDataSource!: DataSource;
  private dataSourceSubject = new BehaviorSubject<string>('json');

  constructor(
    private localJsonService: LocalJsonService,
    private firebaseDataService: FirebaseDataService
  ) {
    this.setDataSource(environment.dataSource as 'json' | 'firebase'); 
  }

  setDataSource(source: 'json' | 'firebase'): void {
    switch (source) {
      case 'json':
        this.currentDataSource = this.localJsonService;
        break;
      case 'firebase':
        this.currentDataSource = this.firebaseDataService;
        break;
      default:
        throw new Error(`Nieznane źródło danych: ${source}`);
    }
    this.dataSourceSubject.next(source); 
  }

  getDataSource(): DataSource {
    return this.currentDataSource;
  }

  onDataSourceChange(): BehaviorSubject<string> {
    return this.dataSourceSubject;
  }
}
