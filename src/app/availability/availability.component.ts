import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataSourceManagerService } from '../data-source-manager.service';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.css']
})
export class AvailabilityComponent implements OnInit {
  cyclicAvailabilityForm: FormGroup;
  oneTimeAvailabilityForm: FormGroup;
  availabilities: any[] = [];
  days: string[] = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

  constructor(private fb: FormBuilder, private dataSourceManager: DataSourceManagerService) {
    this.cyclicAvailabilityForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      days: [[]], 
      startTime: [''],
      endTime: [''],
    });

    this.oneTimeAvailabilityForm = this.fb.group({
      date: [''],
      startTime: [''],
      endTime: [''],
    });
  }

  ngOnInit(): void {
    this.loadAvailabilities();
    this.dataSourceManager.onDataSourceChange().subscribe(() => this.loadAvailabilities());
  }

  loadAvailabilities(): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('availabilities').subscribe(data => {
      this.availabilities = data;
    });
  }

  onSubmitCyclicAvailability(): void {
    const availability = this.cyclicAvailabilityForm.value;
    const dataSource = this.dataSourceManager.getDataSource();

    dataSource.addData('availabilities', availability).subscribe({
      next: () => {
        alert('Cykliczna dostępność została dodana!');
        this.cyclicAvailabilityForm.reset();
        this.loadAvailabilities();
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }

  onSubmitOneTimeAvailability(): void {
    const availability = this.oneTimeAvailabilityForm.value;
    const dataSource = this.dataSourceManager.getDataSource();

    dataSource.addData('availabilities', availability).subscribe({
      next: () => {
        alert('Jednorazowa dostępność została dodana!');
        this.oneTimeAvailabilityForm.reset();
        this.loadAvailabilities();
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }

  removeAvailability(availabilityId: string): void {
    const dataSource = this.dataSourceManager.getDataSource();

    dataSource.removeData('availabilities', availabilityId).subscribe({
      next: () => {
        alert('Dostępność została usunięta.');
        this.loadAvailabilities();
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }
}
