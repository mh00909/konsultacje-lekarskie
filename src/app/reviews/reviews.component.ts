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
  loggedDoctor: string | null = null;
  userId: string | null = null;
  userMail: string | null = null;
  reviews: any[] = [];
  doctorName: string = 'Nieznany lekarz';
  userRole: string | null = null;


  constructor(private route: ActivatedRoute, private dataSourceManager: DataSourceManagerService) {}

  ngOnInit(): void {
    this.loggedDoctor = localStorage.getItem('doctorId');

    this.doctorId = this.route.snapshot.paramMap.get('doctorId');
    this.userRole = JSON.parse(localStorage.getItem('user') || '{}').role;

    console.log(this.doctorId);

    if (this.doctorId) {
      this.loadDoctorAndReviews();
    } else {
      console.error('brak Doctor ID');
    }


  }

  private loadDoctorAndReviews(): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    forkJoin([
      dataSource.getData('doctors'),
      dataSource.getData('reviews'),
      dataSource.getData('users')
    ]).subscribe({
      next: ([doctors, reviews, users]: [any[], any[], any[]]) => {
        const doctor = doctors.find(doc => doc.id === this.doctorId || doc.doctorId === this.doctorId);
        if (doctor) {
          this.doctorName = doctor.name;
        } else {
          console.warn('Doctor not found for ID:', this.doctorId);
          this.doctorName = 'Nieznany lekarz';
        }
  
        this.reviews = reviews
          .filter(review => review.doctorId === this.doctorId)
          .map(review => {
            const user = users.find(user => user.id === review.patientId);
            return {
              ...review,
              patientEmail: user ? user.email : 'Nieznany użytkownik'
            };
          });
  
        console.log('Załadowane recenzje:', this.reviews);
      },
      error: (err) => {
        console.error('Błąd podczas ładowania danych:', err);
      }
    });
  }

  addComment(reviewId: string, comment: string): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId || doctorId !== this.doctorId) {
      alert('Nie masz uprawnień do komentowania tej recenzji.');
      return;
    }
  
    dataSource.update('reviews', reviewId, { doctorComment: comment }).subscribe({
      next: () => {
        alert('Komentarz został dodany!');
        this.loadDoctorAndReviews();
      },
      error: (err) => {
        console.error('Błąd podczas dodawania komentarza:', err);
        alert('Nie udało się dodać komentarza.');
      }
    });
  }
  
  

  loadData(): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    forkJoin([
      dataSource.getData('doctors'),
      dataSource.getData('reviews')
    ]).subscribe({
      next: ([doctors, reviews]: [any[], any[]]) => {
        const doctor = doctors.find((doc: any) => {
          return doc.id === this.doctorId || doc.doctorId === this.doctorId;
        });
  
        if (doctor) {
          this.doctorName = doctor.name;
        } else {
          this.doctorName = 'Nieznany lekarz';
        }
        this.reviews = reviews.filter(review => review.doctorId === this.doctorId);
      },
      error: (err) => {
        console.error('Błąd podczas ładowania danych:', err);
      }
    });
  }
  
  deleteReview(reviewId: string): void {
    if (this.userRole !== 'admin') {
      alert('Tylko administrator może usuwać opinie.');
      return;
    }
  
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.removeData('reviews', reviewId).subscribe({
      next: () => {
        alert('Opinia została usunięta.');
        this.loadDoctorAndReviews(); 
      },
      error: (err) => {
        console.error('Błąd podczas usuwania opinii:', err);
        alert('Nie udało się usunąć opinii.');
      }
    });
  }
  
  
}
