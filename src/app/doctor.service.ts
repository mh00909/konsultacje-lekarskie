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

  getDoctors(): Observable<Doctor[]> {
    const dataSource = this.dataSourceManager.getDataSource();
    return dataSource.getData('users').pipe(
      map((users: any[]) => {
        return users
          .filter(user => user.role === 'doctor')
          .map(user => ({
            id: user.doctorId, 
            name: user.name,
            specialization: user.specialization,
            email: user.email,
            phone:  user.phone,
          }));
      })
    );
  }

  addDoctor(doctor: Doctor & { password: string }): Observable<any> {
    const dataSource = this.dataSourceManager.getDataSource();
  
    const hashedPassword = bcrypt.hashSync(doctor.password, 10);
  
    const user = {
      email: doctor.email,
      password: hashedPassword, 
      role: 'doctor',
      doctorId: doctor.id, // Połączenie z lekarzem
      specialization: doctor.specialization,
      phone: doctor.phone,
      name: doctor.name,
    };
  
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
