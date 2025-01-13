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
    const doctorId = localStorage.getItem('doctorId'); 
  
    if (!doctorId) {
      console.error('Brak doctorId w LocalStorage');
      return;
    }
  
    dataSource.getData('availabilities').subscribe(data => {
      this.availabilities = data.filter(a => a.doctorId === doctorId);
    });
  }
  
  onSubmitCyclicAvailability(): void {
    const doctorId = localStorage.getItem('doctorId'); 
    if (!doctorId) {
      alert('Brak doctorId. Nie można dodać dostępności.');
      return;
    }
  
    const availability = {
      ...this.cyclicAvailabilityForm.value,
      doctorId 
    };
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
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      alert('Brak doctorId. Nie można dodać dostępności.');
      return;
    }
  
    const availability = this.oneTimeAvailabilityForm.value;
    const date = new Date(availability.date);
    const dayMapping: string[] = [
      'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'
    ];
    const dayOfWeek = dayMapping[date.getDay()];
  
    const completeAvailability = {
      ...availability,
      days: [dayOfWeek], 
      doctorId 
    };
  
    const dataSource = this.dataSourceManager.getDataSource();
  
    dataSource.addData('availabilities', completeAvailability).subscribe({
      next: () => {
        alert('Jednorazowa dostępność została dodana!');
        this.oneTimeAvailabilityForm.reset();
        this.loadAvailabilities();
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }
  
}
