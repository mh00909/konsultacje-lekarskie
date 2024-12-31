import { Component } from '@angular/core';
import { DataSourceManagerService } from '../data-source-manager.service';
@Component({
  selector: 'app-data-source-selector',
  templateUrl: './data-source-selector.component.html',
  styleUrl: './data-source-selector.component.css'
})
export class DataSourceSelectorComponent {
  constructor(private dataSourceManager: DataSourceManagerService) {}

  onSourceChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value; 
    this.dataSourceManager.setDataSource(value as 'json' | 'firebase');
  }
  
}