import { Component, OnInit } from '@angular/core';
import { DataSourceManagerService } from '../data-source-manager.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  futureReservations: any[] = [];
  pastReservations: any[] = [];
  userId: string | null = null;
  paymentStatus: string = '';
  isBanned: boolean = false;
  reviews: any[] = []; 

  constructor(private dataSourceManager: DataSourceManagerService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = localStorage.getItem('userId') || null;
    this.checkIfUserIsBanned();
    this.loadReservations();
    this.dataSourceManager.onDataSourceChange().subscribe(() => this.loadReservations());
  }

  loadReservations(): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    forkJoin([
      dataSource.getData('reservations'),
      dataSource.getData('doctors'),
      dataSource.getData('reviews') 
    ]).subscribe({
      next: ([reservations, doctors, reviews]: [any[], any[], any[]]) => {
        console.log('Wszystkie rezerwacje:', reservations);
        console.log('Wszyscy lekarze:', doctors);
        console.log('Wszystkie opinie:', reviews);
  
        const now = new Date();
        const userReservations = reservations.filter(
          (res: any) => res.patientId === this.userId && res.status !== 'odwołane'
        );
  
        userReservations.forEach(reservation => {
          const doctor = doctors.find(doc => doc.id === reservation.doctorId);
          reservation.doctorName = doctor ? doctor.name : 'Nieznany lekarz';
  
          const review = reviews.find(
            r => r.patientId === this.userId && r.doctorId === reservation.doctorId && r.date === reservation.date
          );
          reservation.isReviewed = !!review;
          if (review) {
            reservation.review = review; 
          }
        });
  
        this.futureReservations = userReservations.filter((res: any) => new Date(`${res.date}T${res.startTime}`) > now);
        this.pastReservations = userReservations.filter((res: any) => new Date(`${res.date}T${res.startTime}`) <= now);
  
        console.log('Przyszłe rezerwacje:', this.futureReservations);
        console.log('Przeszłe rezerwacje:', this.pastReservations);
      },
      error: (err) => {
        console.error('Błąd podczas ładowania danych:', err);
      }
    });
  }
  

  simulatePayment(): void {
    this.paymentStatus = 'Weryfikacja płatności...';
  
    let step = 0;
    const steps = [
      'Weryfikacja płatności...',
      'Przetwarzanie transakcji...',
      'Oczekiwanie na potwierdzenie banku...',
      'Płatność zakończona pomyślnie!'
    ];
  
    const interval = setInterval(() => {
      if (step < steps.length) {
        this.paymentStatus = steps[step];
        step++;
      } else {
        clearInterval(interval);
        this.markReservationsAsPaid();
      }
    }, 1000);
  }
  
  markReservationsAsPaid(): void {
    this.futureReservations.forEach(reservation => {
      reservation.isPaid = true; 
      const dataSource = this.dataSourceManager.getDataSource();
      dataSource.update('reservations', reservation.id, { ...reservation, isPaid: true }).subscribe({
        next: () => {
          console.log(`Rezerwacja ${reservation.id} została oznaczona jako opłacona.`);
        },
        error: (err) => {
          console.error(`Błąd podczas oznaczania rezerwacji ${reservation.id} jako opłaconej:`, err);
        }
      });
    });
  
    alert('Twoje płatności zostały zrealizowane pomyślnie!');
  }
  
  
  checkIfUserIsBanned(): void {
    const dataSource = this.dataSourceManager.getDataSource();
    if (!this.userId) {
      this.isBanned = false;
      return;
    }
  
    dataSource.getData('users').subscribe({
      next: (users: any[]) => {
        const user = users.find(u => u.id === this.userId);
        this.isBanned = user?.isBanned || false;
      },
      error: (err) => {
        console.error('Błąd podczas sprawdzania użytkownika:', err);
      }
    });
  }

  cancelReservation(reservation: any): void {
    const dataSource = this.dataSourceManager.getDataSource();

    dataSource.removeData('reservations', reservation.id).subscribe({
      next: () => {
        this.futureReservations = this.futureReservations.filter(r => r.id !== reservation.id);
        alert('Rezerwacja została anulowana.');
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }

  addReview(reservation: any, rating: number, comment: string): void {
    if (reservation.isReviewed) {
      alert('Już dodałeś opinię do tej wizyty.');
      return;
    }

    const dataSource = this.dataSourceManager.getDataSource();
  
    const review = {
      doctorId: reservation.doctorId,
      doctorName: reservation.doctorName,
      patientId: this.userId,
      rating,
      comment,
      date: reservation.date 
    };
  
    dataSource.addData('reviews', review).subscribe({
      next: () => {
        alert('Dziękujemy za Twoją opinię!');
        reservation.isReviewed = true; 
        reservation.review = review;
      },
      error: (err) => alert(`Błąd dodawania opinii: ${err.message}`)
    });
  }
}
