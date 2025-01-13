import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Doctor, DoctorService } from '../doctor.service';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  userRole: string | null = null; // Rola użytkownika
  showAddDoctorForm: boolean = false; // Flaga do wyświetlania formularza
  addDoctorForm: FormGroup; // Formularz dodawania lekarza
  isLoggedIn: boolean = false;

  constructor(private doctorService: DoctorService, private fb: FormBuilder) {
    this.addDoctorForm = this.fb.group({
      name: ['', Validators.required],
      specialization: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
    this.userRole = JSON.parse(localStorage.getItem('user') || '{}').role; // Pobierz rolę użytkownika
    this.isLoggedIn = !(this.userRole == '{}');
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania listy lekarzy:', err);
        alert('Nie udało się załadować listy lekarzy.');
      },
    });
  }

  toggleAddDoctorForm(): void {
    this.showAddDoctorForm = !this.showAddDoctorForm; // Przełącz widoczność formularza
  }

  onSubmitAddDoctor(): void {
    if (this.addDoctorForm.invalid) {
      alert('Wypełnij wszystkie wymagane pola.');
      return;
    }

    const doctor: Doctor = this.addDoctorForm.value;
    this.doctorService.addDoctor(doctor).subscribe({
      next: () => {
        alert('Lekarz został dodany.');
        this.loadDoctors();
        this.addDoctorForm.reset();
        this.showAddDoctorForm = false; // Ukryj formularz po dodaniu lekarza
      },
      error: (err) => {
        console.error('Błąd podczas dodawania lekarza:', err);
        alert('Nie udało się dodać lekarza.');
      },
    });
  }

  deleteDoctor(doctorId: string): void {
    const confirmDelete = confirm('Czy na pewno chcesz usunąć tego lekarza?');
    if (!confirmDelete) return;

    this.doctorService.removeDoctor(doctorId).subscribe({
      next: () => {
        alert('Lekarz został usunięty.');
        this.loadDoctors();
      },
      error: (err) => {
        console.error('Błąd podczas usuwania lekarza:', err);
        alert('Nie udało się usunąć lekarza.');
      },
    });
  }
}
