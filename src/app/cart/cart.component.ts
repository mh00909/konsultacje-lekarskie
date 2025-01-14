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

  constructor(private dataSourceManager: DataSourceManagerService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = localStorage.getItem('userId') || null;

    this.loadReservations();
    this.dataSourceManager.onDataSourceChange().subscribe(() => this.loadReservations());
  }

  loadReservations(): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    // Pobierz dane rezerwacji i lekarzy
    forkJoin([
      dataSource.getData('reservations'),
      dataSource.getData('doctors')
    ]).subscribe({
      next: ([reservations, doctors]: [any[], any[]]) => {
        console.log('Wszystkie rezerwacje:', reservations);
        console.log('Wszystkie lekarze:', doctors);
  
        const now = new Date();
        const userReservations = reservations.filter((res: any) => res.patientId === this.userId && res.status !== 'odwołane' );
  
        // Uzupełnij rezerwacje o nazwę lekarza
        userReservations.forEach(reservation => {
          const doctor = doctors.find(doc => doc.id === reservation.doctorId);
          reservation.doctorName = doctor ? doctor.name : 'Nieznany lekarz';
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
    this.paymentStatus = 'Płatność w trakcie...';

    setTimeout(() => {
      this.paymentStatus = 'Płatność zakończona pomyślnie!';
    }, 2000);
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
    const dataSource = this.dataSourceManager.getDataSource();
  
    const review = {
      doctorId: reservation.doctorId,
      doctorName: reservation.doctorName, // Użyj nazwy lekarza z rezerwacji
      patientId: this.userId,
      rating,
      comment,
      date: new Date().toISOString()
    };
  
    dataSource.addData('reviews', review).subscribe({
      next: () => {
        alert('Dziękujemy za Twoją opinię!');
        reservation.isReviewed = true; // Oznacz rezerwację jako ocenioną
      },
      error: (err) => alert(`Błąd dodawania opinii: ${err.message}`)
    });
  }
  
  
}
