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

  isProcessing = false; // Flaga przetwarzania
  reservationSuccess = false; // Flaga sukcesu rezerwacji

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
      doctorId: ['', Validators.required],
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
      if (params['doctorId']) {
        this.reservationForm.patchValue({ doctorId: params['doctorId'] });
      }
    });
  }
  

  onSubmitReservation(): void {
    console.log('Rozpoczęcie procesu rezerwacji', { isProcessing: this.isProcessing, reservationSuccess: this.reservationSuccess });

    // Zablokowanie wielokrotnego przetwarzania
    if (this.isProcessing || this.reservationSuccess) {
      console.log('Proces rezerwacji już trwa lub zakończony sukcesem. Przerywam.');
      return;
    }

    this.isProcessing = true;
    const reservation = this.reservationForm.value;
    const slots = this.generateSlots(reservation.date, reservation.startTime, reservation.duration);

    // Pobranie dostępności i rezerwacji
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('availabilities').subscribe({
      next: availabilities => {
        const isAvailable = this.validateAvailability(slots, reservation.date, availabilities);

        if (!isAvailable) {
          alert('Niektóre sloty są poza dostępnością lekarza. Wybierz inny termin.');
          this.resetProcessingFlags();
          return;
        }

        this.checkExistingReservations(slots, reservation);
      },
      error: err => {
        console.error('Błąd podczas sprawdzania dostępności:', err);
        this.handleError(`Błąd sprawdzania dostępności lekarza: ${err.message}`);
      }
    });
  }

  private checkExistingReservations(slots: string[], reservation: any): void {
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('reservations').subscribe({
      next: existingReservations => {
        const occupiedSlots = existingReservations
          .filter(res => res.date === reservation.date)
          .flatMap(res => res.slots || []);

        const conflictingSlots = slots.filter(slot => occupiedSlots.includes(slot));
        if (conflictingSlots.length > 0) {
          alert(`Niektóre sloty są już zajęte: ${conflictingSlots.join(', ')}. Wybierz inny termin.`);
          this.resetProcessingFlags();
          return;
        }

        this.saveReservation(slots, reservation);
      },
      error: err => {
        console.error('Błąd sprawdzania istniejących rezerwacji:', err);
        this.handleError(`Błąd sprawdzania istniejących rezerwacji: ${err.message}`);
      }
    });
  }

  private saveReservation(slots: string[], reservation: any): void {
    const dataSource = this.dataSourceManager.getDataSource();
    const fullReservation = { ...reservation, slots };

    dataSource.addData('reservations', fullReservation).subscribe({
      next: () => {
        console.log('Rezerwacja zakończona sukcesem:', fullReservation);
        this.reservationSuccess = true;
        alert('Rezerwacja zakończona sukcesem!');
        this.reservationForm.reset();
        this.resetProcessingFlags();
      },
      error: err => {
        console.error('Błąd podczas dodawania rezerwacji:', err);
        this.handleError(`Błąd zapisu rezerwacji: ${err.message}`);
      }
    });
  }

  private validateAvailability(slots: string[], date: string, availabilities: any[]): boolean {
    const dayMapping: { [key: string]: string } = {
      Monday: 'Poniedziałek',
      Tuesday: 'Wtorek',
      Wednesday: 'Środa',
      Thursday: 'Czwartek',
      Friday: 'Piątek',
      Saturday: 'Sobota',
      Sunday: 'Niedziela',
    };

    return slots.every(slot => {
      return availabilities.some(availability => {
        if (!availability.days || !availability.startTime || !availability.endTime) {
          console.warn('Niepełne dane dostępności:', availability);
          return false;
        }

        const reservationDate = new Date(date);
        const reservationDayEnglish = reservationDate.toLocaleDateString('en-US', { weekday: 'long' });
        const reservationDayPolish = dayMapping[reservationDayEnglish];

        const inDateRange =
          reservationDate >= new Date(availability.startDate) &&
          reservationDate <= new Date(availability.endDate);

        const isDayAvailable = availability.days.includes(reservationDayPolish);

        const [slotHours, slotMinutes] = slot.split(':').map(Number);
        const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
        const [endHours, endMinutes] = availability.endTime.split(':').map(Number);

        const slotTimeInMinutes = slotHours * 60 + slotMinutes;
        const startTimeInMinutes = startHours * 60 + startMinutes;
        const endTimeInMinutes = endHours * 60 + endMinutes;

        const isTimeAvailable = slotTimeInMinutes >= startTimeInMinutes && slotTimeInMinutes < endTimeInMinutes;

        return inDateRange && isDayAvailable && isTimeAvailable;
      });
    });
  }

  private generateSlots(date: string, startTime: string, duration: number): string[] {
    const slots: string[] = [];
    const startDate = new Date(`${date}T${startTime}`);
    for (let i = 0; i < duration * 2; i++) {
      const slotTime = new Date(startDate.getTime() + i * 30 * 60 * 1000);
      slots.push(slotTime.toTimeString().slice(0, 5));
    }
    return slots;
  }

  private resetProcessingFlags(): void {
    this.isProcessing = false;
    this.reservationSuccess = false;
    console.log('Flagi zresetowane', { isProcessing: this.isProcessing, reservationSuccess: this.reservationSuccess });
  }

  private handleError(message: string): void {
    alert(message);
    this.resetProcessingFlags();
  }
}
