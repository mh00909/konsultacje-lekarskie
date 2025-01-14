import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DataSourceManagerService } from '../data-source-manager.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  doctorId: string | null = null;
  reviews: any[] = [];
  doctorName: string = 'Nieznany lekarz';

  constructor(private route: ActivatedRoute, private dataSourceManager: DataSourceManagerService) {}

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.paramMap.get('doctorId');
    if (this.doctorId) {
      this.loadDoctorAndReviews();
    } else {
      console.error('Doctor ID not provided in route.');
    }
  }

  private loadDoctorAndReviews(): void {
    const dataSource = this.dataSourceManager.getDataSource();
    forkJoin([
      dataSource.getData('doctors'),
      dataSource.getData('reviews'),
    ]).subscribe({
      next: ([doctors, reviews]: [any[], any[]]) => {
        console.log('Loaded doctors:', doctors);
        const doctor = doctors.find(doc => doc.id === this.doctorId);
        if (doctor) {
          this.doctorName = doctor.name;
        } else {
          console.warn('Doctor not found for ID:', this.doctorId);
        }
        this.reviews = reviews.filter(review => review.doctorId === this.doctorId);
      },
      error: (err) => {
        console.error('Error loading doctors or reviews:', err);
      }
    });
  }

  loadData(): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    // Debuguj doctorId
    console.log('ID lekarza (route):', this.doctorId);
  
    // Pobierz dane lekarza i recenzje równolegle
    forkJoin([
      dataSource.getData('doctors'),
      dataSource.getData('reviews')
    ]).subscribe({
      next: ([doctors, reviews]: [any[], any[]]) => {
        console.log('Załadowane dane lekarzy:', doctors);
        console.log('Załadowane recenzje:', reviews);
  
        // Znajdź lekarza na podstawie id
        const doctor = doctors.find((doc: any) => {
          return doc.id === this.doctorId || doc.doctorId === this.doctorId;
        });
  
        if (doctor) {
          this.doctorName = doctor.name;
        } else {
          this.doctorName = 'Nieznany lekarz';
        }
        console.log('Znaleziony lekarz:', doctor);
  
        // Filtruj recenzje dla danego lekarza
        this.reviews = reviews.filter(review => review.doctorId === this.doctorId);
        console.log('Filtracja recenzji:', this.reviews);
      },
      error: (err) => {
        console.error('Błąd podczas ładowania danych:', err);
      }
    });
  }
  
  
  
}
