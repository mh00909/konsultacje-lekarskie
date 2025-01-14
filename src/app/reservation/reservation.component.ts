import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  userId: string | null = null; // ID użytkownika

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dataSourceManager: DataSourceManagerService
  ) {
    this.reservationForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(0.5)]],
      type: ['', Validators.required],
      patientName: ['', Validators.required],
      doctorName: ['', Validators.required],
      doctorId: ['', Validators.required],
      patientId: ['', Validators.required],
      gender: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Pobierz `userId` z `localStorage`
    this.userId = localStorage.getItem('userId');

    if (!this.userId) {
      // Jeśli brak `userId`, przekieruj na stronę logowania
      alert('Nie jesteś zalogowany. Zaloguj się, aby kontynuować.');
      this.router.navigate(['/login']);
      return;
    }

    // Ustaw `userId` w formularzu
    this.reservationForm.patchValue({ patientId: this.userId });

    // Pobierz parametry z trasy
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

    if (this.isProcessing || this.reservationSuccess) {
      console.log('Proces rezerwacji już trwa lub zakończony sukcesem. Przerywam.');
      return;
    }

    this.isProcessing = true;

    const reservation = {
      ...this.reservationForm.value,
      userId: this.userId // Dodaj `userId` do rezerwacji
    };

    const slots = this.generateSlots(reservation.date, reservation.startTime, reservation.duration);

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
        // Filtrowanie rezerwacji dla danego dnia i lekarza
        const occupiedSlots = existingReservations
          .filter(res => res.date === reservation.date && res.doctorId === reservation.doctorId)
          .flatMap(res => res.slots || []);
  
        console.log('Istniejące rezerwacje dla lekarza:', reservation.doctorId, occupiedSlots);
  
        // Sprawdzenie kolizji slotów
        const isOverlapping = (slot: string, reservationSlots: string[], reservationDate: string, reservationDuration: number): boolean => {
          return reservationSlots.some(reservedSlot => {
            const reservedTime = new Date(`${reservationDate}T${reservedSlot}`);
            const slotTime = new Date(`${reservationDate}T${slot}`);
            const reservedEndTime = new Date(reservedTime.getTime() + reservationDuration * 60 * 60 * 1000);
            return slotTime >= reservedTime && slotTime < reservedEndTime;
          });
        };
  
        const conflictingSlots = slots.filter(slot =>
          isOverlapping(slot, occupiedSlots, reservation.date, reservation.duration)
        );
  
        console.log('Kolidujące sloty:', conflictingSlots);
  
        if (conflictingSlots.length > 0) {
          alert(`Niektóre sloty są już zajęte przez lekarza: ${conflictingSlots.join(', ')}. Wybierz inny termin.`);
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

    console.log('Sloty do sprawdzenia:', slots);
console.log('Dostępności lekarza:', availabilities);

return slots.every(slot => {
  const isAvailable = availabilities.some(availability => {
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

    console.log('Walidacja slotu:', slot, {
      inDateRange,
      isDayAvailable,
      isTimeAvailable
    });

    return inDateRange && isDayAvailable && isTimeAvailable;
  });

  if (!isAvailable) {
    console.warn('Slot niedostępny:', slot);
  }

  return isAvailable;
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
