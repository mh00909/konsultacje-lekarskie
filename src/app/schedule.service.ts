import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { DataSourceManagerService } from './data-source-manager.service';

interface Availability {
  id?: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  days: string[];
  startTime: string;
  endTime: string;
}

interface OneTimeAvailability {
  id?: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Absence {
  id?: string;
  doctorId: string;
  date: string;
}

interface Reservation {
  id?: string;
  doctorId: string;
  patientId: string;
  date: string;
  startTime: string;
  duration: number;
  type: string;
  patientName: string;
  gender: string;
  age: number;
  notes: string;
  slots: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private availabilitySubject = new BehaviorSubject<Availability[]>([]);
  public availability$ = this.availabilitySubject.asObservable();

  private absencesSubject = new BehaviorSubject<Absence[]>([]);
  public absences$ = this.absencesSubject.asObservable();

  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  public reservations$ = this.reservationsSubject.asObservable();

  constructor(private dataSourceManager: DataSourceManagerService) {}

  fetchAvailabilities(): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('availabilities').pipe(take(1)).subscribe({
      next: (data) => {
        this.availabilitySubject.next(data);
      },
      error: (err) => {
        console.error('Błąd podczas pobierania dostępności:', err);
      }
    });
  }
  

  addAvailability(availability: Availability): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.addData('availabilities', availability).subscribe({
      next: () => this.fetchAvailabilities(),
      error: (err) => console.error(`Błąd podczas dodawania dostępności: ${err.message}`),
    });
  }

  removeAvailability(availabilityId: string): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.removeData('availabilities', availabilityId).subscribe({
      next: () => this.fetchAvailabilities(),
      error: (err) => console.error(`Błąd podczas usuwania dostępności: ${err.message}`),
    });
  }

  fetchAbsences(): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('absences').subscribe(data => {
      this.absencesSubject.next(data);
    });
  }

  addAbsence(absence: Absence): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.addData('absences', absence).subscribe({
      next: () => this.fetchAbsences(),
      error: (err) => console.error(`Błąd podczas dodawania absencji: ${err.message}`),
    });
  }

  removeAbsence(absenceId: string): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.removeData('absences', absenceId).subscribe({
      next: () => this.fetchAbsences(),
      error: (err) => console.error(`Błąd podczas usuwania absencji: ${err.message}`),
    });
  }

  fetchReservations(): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('reservations').pipe(take(1)).subscribe({
      next: (data) => {
        this.reservationsSubject.next(data); 
      },
      error: (err) => {
        console.error('Błąd podczas pobierania rezerwacji:', err);
      }
    });
  }
  

  isProcessing = false;
  addReservation(reservation: Reservation): void {
    if (this.isProcessing) return; 
  
    if (this.isConflict(reservation)) {
      alert('Termin jest już zajęty lub koliduje z nieobecnością.');
      return; 
    }
  
    this.isProcessing = true; 
  
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.addData('reservations', reservation).subscribe({
      next: () => {
        this.fetchReservations(); 
        alert('Rezerwacja została potwierdzona.');
        this.isProcessing = false; 
      },
      error: (err) => {
        alert(`Błąd podczas rejestracji rezerwacji: ${err.message}`);
        this.isProcessing = false; 
      }
    });
  }
  
  

  removeReservation(reservationId: string): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.removeData('reservations', reservationId).subscribe({
      next: () => this.fetchReservations(),
      error: (err) => console.error(`Błąd podczas usuwania rezerwacji: ${err.message}`),
    });
  }

  isConflict(reservation: Reservation): boolean {
    return (
      this.absencesSubject.value.some(absence => absence.date === reservation.date) ||
      this.reservationsSubject.value.some(
        existing =>
          existing.date === reservation.date &&
          existing.startTime === reservation.startTime
      )
    );
  }
}
