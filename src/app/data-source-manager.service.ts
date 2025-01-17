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
    private firebaseDataService: FirebaseDataService,
  ) {
    //this.setDataSource(environment.dataSource as 'json' | 'firebase' ); 
    this.initializeDataSource();
  
  }

  setDataSource(source: 'json' | 'firebase' ): void {
    console.log('Ustawianie źródła danych:', source);
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
    localStorage.setItem('dataSource', source);
    this.dataSourceSubject.next(source); 
  }

  getDataSource(): DataSource {
    return this.currentDataSource;
  }

  onDataSourceChange(): BehaviorSubject<string> {
    return this.dataSourceSubject;
  }
  initializeDataSource(): void {
    const savedSource = localStorage.getItem('dataSource') as 'json' | 'firebase';
    const sourceToSet = savedSource || environment.dataSource;
    this.setDataSource(sourceToSet);
  }


  update(collection: string, id: string, updatedData: any): void {
    if (!this.currentDataSource) {
      console.error('Źródło danych nie zostało zainicjalizowane.');
      throw new Error('Źródło danych nie zostało zainicjalizowane.');
    }

    console.log(`Aktualizowanie danych w kolekcji "${collection}" z ID: ${id}`, updatedData);

    this.currentDataSource.update(collection, id, updatedData).subscribe({
      next: () => {
        console.log(`Dane w kolekcji "${collection}" z ID: ${id} zostały zaktualizowane.`);
      },
      error: (err) => {
        console.error(`Błąd podczas aktualizacji danych w kolekcji "${collection}" z ID: ${id}:`, err);
      }
    });
  }
}
