import { Component, OnInit } from '@angular/core';
import { DataSourceManagerService } from '../data-source-manager.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  reservations: any[] = [];
  paymentStatus: string = '';

  constructor(private dataSourceManager: DataSourceManagerService) {}

  ngOnInit(): void {
    this.loadReservations();
    this.dataSourceManager.onDataSourceChange().subscribe(() => this.loadReservations());
  }

  loadReservations(): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('reservations').subscribe(data => {
      this.reservations = data;
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
        this.reservations = this.reservations.filter(r => r !== reservation);
        alert('Rezerwacja została anulowana.');
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }
}
