import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSourceManagerService } from './data-source-manager.service';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  constructor(private dataSourceManager: DataSourceManagerService) {}

  // Pobieranie listy lekarzy (użytkowników z rolą 'doctor')
  getDoctors(): Observable<Doctor[]> {
    const dataSource = this.dataSourceManager.getDataSource();
    return dataSource.getData('users').pipe(
      map((users: any[]) => users.filter(user => user.role === 'doctor'))
    );
  }

  addDoctor(doctor: Doctor): Observable<any> {
    const dataSource = this.dataSourceManager.getDataSource();
  
    // Tworzenie obiektu użytkownika dla logowania
    const user = {
      email: doctor.email,
      password: 'defaultPassword', // Domyślne hasło
      role: 'doctor',
      doctorId: doctor.id, // Połączenie z lekarzem
      specialization: doctor.specialization,
      phone: doctor.phone,
      name: doctor.name
    };
  
    // Dodaj lekarza i użytkownika
    return new Observable((observer) => {
      dataSource.addData('doctors', doctor).subscribe({
        next: (doctorRef) => {
          user.doctorId = doctorRef.id; 
          dataSource.addData('users', user).subscribe({
            next: () => {
              observer.next(doctorRef);
              observer.complete();
            },
            error: (err) => observer.error(err),
          });
        },
        error: (err) => observer.error(err),
      });
    });
  }
  
  removeDoctor(doctorId: string): Observable<void> {
    const dataSource = this.dataSourceManager.getDataSource();
    return dataSource.removeData('users', doctorId);
  }
}
