import { Component, OnInit } from '@angular/core';
import { DataSourceManagerService } from '../data-source-manager.service';

@Component({
  selector: 'app-data-list',
  template: `
    <ul>
      <li *ngFor="let item of data">{{ item | json }}</li>
    </ul>
  `
})
export class DataListComponent implements OnInit {
  data: any[] = [];

  constructor(private dataSourceManager: DataSourceManagerService) {}

  ngOnInit(): void {
    this.dataSourceManager.onDataSourceChange().subscribe(() => {
      this.fetchData();
    });
    this.fetchData(); 
  }

  fetchData(): void {
    this.dataSourceManager.getDataSource().getData('users').subscribe(data => {
      this.data = data;
    });
  }
}
