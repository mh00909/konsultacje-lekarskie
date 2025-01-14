import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSourceManagerService } from './data-source-manager.service';
import * as bcrypt from 'bcryptjs';

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
      map((users: any[]) => {
        return users
          .filter(user => user.role === 'doctor')
          .map(user => ({
            id: user.doctorId, // Użyj doctorId zamiast userId
            name: user.name,
            specialization: user.specialization,
            email: user.email,
            phone: user.phone,
          }));
      })
    );
  }

  addDoctor(doctor: Doctor): Observable<any> {
    const dataSource = this.dataSourceManager.getDataSource();

    
    const hashedPassword = bcrypt.hashSync('password', 10);

    // Tworzenie obiektu użytkownika dla logowania
    const user = {
      email: doctor.email,
      password: hashedPassword, // Zhashowane hasło
      role: 'doctor',
      doctorId: doctor.id, // Połączenie z lekarzem
      specialization: doctor.specialization,
      phone: doctor.phone,
      name: doctor.name,
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
