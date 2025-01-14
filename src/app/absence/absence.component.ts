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
  cyclicAbsenceForm: FormGroup;
  absences: any[] = [];

  constructor(private fb: FormBuilder, private dataSourceManager: DataSourceManagerService) {
    this.absenceForm = this.fb.group({
      date: [''] 
    });
    this.cyclicAbsenceForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      days: [[]] 
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
    const doctorId = localStorage.getItem('doctorId'); // Pobierz ID lekarza
    if (!doctorId) {
      alert('Brak doctorId. Nie można dodać absencji.');
      return;
    }
  
    const absence = {
      ...this.absenceForm.value,
      doctorId // Dodaj ID lekarza do absencji
    };
  
    const dataSource = this.dataSourceManager.getDataSource();
  
    dataSource.addData('absences', absence).subscribe({
      next: () => {
        alert('Absencja została dodana!');
        this.updateAffectedReservations(absence.date, doctorId); // Aktualizuj wizyty
        this.absenceForm.reset();
        this.loadAbsences();
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }
  
  onSubmitCyclicAbsence(): void {
    const doctorId = localStorage.getItem('doctorId'); // Pobierz ID lekarza
    if (!doctorId) {
      alert('Brak doctorId. Nie można dodać cyklicznej absencji.');
      return;
    }
  
    const cyclicAbsence = {
      ...this.cyclicAbsenceForm.value,
      doctorId // Dodaj ID lekarza do cyklicznej absencji
    };
  
    const dataSource = this.dataSourceManager.getDataSource();
  
    dataSource.addData('absences', cyclicAbsence).subscribe({
      next: () => {
        alert('Cykliczna absencja została dodana!');
        this.updateAffectedReservationsForCyclic(cyclicAbsence, doctorId); // Aktualizuj wizyty
        this.cyclicAbsenceForm.reset();
        this.loadAbsences();
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }

  private updateAffectedReservationsForCyclic(cyclicAbsence: any, doctorId: string): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    dataSource.getData('reservations').subscribe({
      next: (reservations: any[]) => {
        const { startDate, endDate, days } = cyclicAbsence;
  
        // Przefiltruj wizyty zgodne z cykliczną absencją
        const affectedReservations = reservations.filter((res) => {
          const reservationDate = new Date(res.date);
          const absenceStartDate = new Date(startDate);
          const absenceEndDate = new Date(endDate);
  
          const isWithinDateRange = reservationDate >= absenceStartDate && reservationDate <= absenceEndDate;
          const isDayMatch = days.includes(
            reservationDate.toLocaleDateString('pl-PL', { weekday: 'long' })
          );
  
          return res.doctorId === doctorId && isWithinDateRange && isDayMatch;
        });
  
        // Zaktualizuj status dla każdej wizyty
        affectedReservations.forEach((reservation) => {
          const updatedReservation = {
            ...reservation,
            status: 'odwołane'
          };
  
          dataSource.update('reservations', reservation.id, updatedReservation).subscribe({
            next: () => {
              console.log(`Rezerwacja ${reservation.id} została zaktualizowana na odwołaną.`);
            },
            error: (err) => {
              console.error(`Nie udało się zaktualizować rezerwacji ${reservation.id}: ${err.message}`);
            }
          });
        });
      },
      error: (err) => {
        console.error('Nie udało się pobrać rezerwacji:', err);
      }
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

  private updateAffectedReservations(date: string, doctorId: string): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    dataSource.getData('reservations').subscribe({
      next: (reservations: any[]) => {
        const affectedReservations = reservations.filter(
          (res) => res.date === date && res.doctorId === doctorId
        );
  
        affectedReservations.forEach((reservation) => {
          const updatedReservation = {
            ...reservation,
            status: 'odwołane'
          };
  
          dataSource.update('reservations', reservation.id, updatedReservation).subscribe({
            next: () => {
              console.log(`Rezerwacja ${reservation.id} została zaktualizowana na odwołaną.`);
            },
            error: (err) => {
              console.error(`Nie udało się zaktualizować rezerwacji ${reservation.id}: ${err.message}`);
            }
          });
        });
      },
      error: (err) => {
        console.error('Nie udało się pobrać rezerwacji:', err);
      }
    });
  }
  
}
