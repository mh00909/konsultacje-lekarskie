import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataSourceManagerService } from '../data-source-manager.service';

@Component({
  selector: 'app-absence',
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.css']
})
export class AbsenceComponent implements OnInit {
  absenceForm: FormGroup;
  absences: any[] = [];

  constructor(private fb: FormBuilder, private dataSourceManager: DataSourceManagerService) {
    this.absenceForm = this.fb.group({
      date: [''] 
    });
  }

  ngOnInit(): void {
    this.loadAbsences();
    this.dataSourceManager.onDataSourceChange().subscribe(() => this.loadAbsences());
  }

  loadAbsences(): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('absences').subscribe(data => {
      this.absences = data;
    });
  }

  onSubmitAbsence(): void {
    const absence = this.absenceForm.value;
    const dataSource = this.dataSourceManager.getDataSource();

    dataSource.addData('absences', absence).subscribe({
      next: () => {
        alert('Absencja została dodana!');
        this.absenceForm.reset();
        this.loadAbsences();
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }

  removeAbsence(absenceId: string): void {
    const dataSource = this.dataSourceManager.getDataSource();

    dataSource.removeData('absences', absenceId).subscribe({
      next: () => {
        alert('Absencja została usunięta.');
        this.loadAbsences();
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }
}
