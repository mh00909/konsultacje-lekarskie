import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataSourceManagerService } from '../data-source-manager.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  reservationForm: FormGroup;

  durations: number[] = [0.5, 1, 1.5, 2];
  consultationTypes: string[] = ['Pierwsza wizyta', 'Wizyta kontrolna', 'Choroba przewlekła', 'Recepta'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dataSourceManager: DataSourceManagerService
  ) {
    this.reservationForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(0.5)]],
      type: ['', Validators.required],
      patientName: ['', Validators.required],
      gender: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.reservationForm.patchValue({
          date: params['date'],
          startTime: params['time']
        });
      }
    });
  }


  onSubmitReservation(): void {
    const reservation = this.reservationForm.value;
  
    const slots: string[] = [];
    const startDate = new Date(`${reservation.date}T${reservation.startTime}`);
    for (let i = 0; i < reservation.duration * 2; i++) {
      const slotTime = new Date(startDate.getTime() + i * 30 * 60 * 1000);
      const hours = slotTime.getHours().toString().padStart(2, '0');
      const minutes = slotTime.getMinutes().toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
    }
    console.log('Proponowane sloty do rezerwacji:', slots);
  
    const dataSource = this.dataSourceManager.getDataSource();
  
    dataSource.getData('availabilities').subscribe({
      next: (availabilities: any[]) => {
        console.log('Dostępność lekarza:', availabilities);
  
        const dayMapping: { [key: string]: string } = {
          Monday: 'Poniedziałek',
          Tuesday: 'Wtorek',
          Wednesday: 'Środa',
          Thursday: 'Czwartek',
          Friday: 'Piątek',
          Saturday: 'Sobota',
          Sunday: 'Niedziela',
        };
  
        // Sprawdzanie dostępności lekarza dla nowych slotów
        const isAvailable = slots.every(slot => {
          return availabilities.some(availability => {
            const reservationDate = new Date(reservation.date);
            const reservationDayEnglish = reservationDate.toLocaleDateString('en-US', { weekday: 'long' });
            const reservationDayPolish = dayMapping[reservationDayEnglish];
  
            const inDateRange =
              reservationDate >= new Date(availability.startDate) &&
              reservationDate <= new Date(availability.endDate);
            const isDayAvailable =
              availability.days.includes(reservationDayEnglish) || availability.days.includes(reservationDayPolish);
  
            const [slotHours, slotMinutes] = slot.split(':').map(Number);
            const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
            const [endHours, endMinutes] = availability.endTime.split(':').map(Number);
  
            const slotTimeInMinutes = slotHours * 60 + slotMinutes;
            const startTimeInMinutes = startHours * 60 + startMinutes;
            const endTimeInMinutes = endHours * 60 + endMinutes;
  
            const isTimeAvailable =
              slotTimeInMinutes >= startTimeInMinutes && slotTimeInMinutes < endTimeInMinutes;
  
            return inDateRange && isDayAvailable && isTimeAvailable;
          });
        });
  
        if (!isAvailable) {
          alert('Niektóre sloty są poza dostępnością lekarza. Wybierz inny termin.');
          return;
        }
  
        console.log('Sloty są dostępne, sprawdzanie rezerwacji...');
        this.checkExistingReservations(slots, reservation);
      },
      error: (err) => {
        console.error('Błąd podczas sprawdzania dostępności lekarza:', err);
        alert(`Błąd sprawdzania dostępności lekarza: ${err.message}`);
      }
    });
  }
  
  private checkExistingReservations(slots: string[], reservation: any): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('reservations').subscribe({
      next: (existingReservations: any[]) => {
        console.log('Istniejące rezerwacje:', existingReservations);
  
        const filteredReservations = existingReservations.filter(
          res => res.date === reservation.date
        );
        const occupiedSlots = filteredReservations.flatMap(res => res.slots);
  
        console.log('Zajęte sloty:', occupiedSlots);

        const conflict = slots.some(slot => occupiedSlots.includes(slot));
  
        if (conflict) {
          alert('Niektóre sloty są już zajęte. Wybierz inny termin.');
          return;
        }
  
        this.saveReservation(slots, reservation);
      },
      error: (err) => {
        console.error('Błąd podczas sprawdzania istniejących rezerwacji:', err);
        alert(`Błąd sprawdzania istniejących rezerwacji: ${err.message}`);
      }
    });
  }
  
  private saveReservation(slots: string[], reservation: any): void {
    const dataSource = this.dataSourceManager.getDataSource();
    const fullReservation = { ...reservation, slots };
  
    dataSource.addData('reservations', fullReservation).subscribe({
      next: () => {
        alert('Rezerwacja zakończona sukcesem!');
        this.reservationForm.reset();
      },
      error: (err) => {
        console.error('Błąd zapisu rezerwacji:', err);
        alert(`Błąd: ${err.message}`);
      }
    });
  }
  





  cancelReservation(reservation: any): void {
    const dataSource = this.dataSourceManager.getDataSource();

    dataSource.removeData('reservations', reservation.id).subscribe({
      next: () => alert('Rezerwacja została anulowana.'),
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }
}
