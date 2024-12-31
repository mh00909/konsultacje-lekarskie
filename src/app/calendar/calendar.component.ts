import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DataSourceManagerService } from '../data-source-manager.service';

const CONSULTATION_COLORS: { [key: string]: string } = {
  'Pierwsza wizyta': '#ffd700',
  'Wizyta kontrolna': '#87cefa',
  'Choroba przewlekła': '#ff7f50',
  'Recepta': '#90ee90',
};

@Component({
  selector: 'app-calendar',
  standalone: false,
  
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})



export class CalendarComponent implements OnInit {
  viewMode: 'week' | 'day' = 'week';
  selectedDayIndex: number = 0; 
  days: string[] = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
  timeSlots: string[] = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0'); 
    const minutes = (i % 2 === 0 ? '00' : '30');
    return `${hours}:${minutes}`;
  });
  
  absences: any[] = [];
  reservations: any[] = [];
  availabilities: any[] = [];
  currentWeekStart: Date = this.getStartOfWeek(new Date());

  selectedDetails: any = null;
  detailsVisible = false; 
  detailsPosition = { top: '0px', left: '0px' }; 

  constructor(private dataSourceManager: DataSourceManagerService, private router: Router) {}

  ngOnInit(): void {
    this.dataSourceManager.onDataSourceChange().subscribe(() => {
      this.fetchData();
    });
    this.fetchData();
  }

  fetchData(): void {
    const dataSource = this.dataSourceManager.getDataSource();

    dataSource.getData('reservations').subscribe(data => {
      this.reservations = data;
    });

    dataSource.getData('availabilities').subscribe(data => {
      this.availabilities = data;
    });

    dataSource.getData('absences').subscribe(data => {
      this.absences = data;
    });
  }
  

  getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Poniedziałek jako pierwszy dzień tygodnia
    return new Date(date.setDate(diff));
  }

  getDateForDay(index: number): string {
    const targetDate = new Date(this.currentWeekStart);
    targetDate.setDate(this.currentWeekStart.getDate() + index);
    return targetDate.toISOString().split('T')[0];
  }

  changeWeek(offset: number): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + offset * 7);
  }

  getReservationsCountForDay(index: number): number {
    const date = this.getDateForDay(index);
    return this.reservations.filter((reservation) => reservation.date === date).length;
  }

  getSlotDetails(day: string, time: string): string {
    const date = this.getDateForDay(this.days.indexOf(day));
    const reservation = this.reservations.find(
      (r) => r.date === date && r.slots.includes(time)
    );
  
    if (reservation) {
      return this.isSlotAbsent(day)
        ? 'Odwołane' // Jeśli jest absencja, oznacz jako odwołane
        : reservation.type; // Inaczej wyświetl typ rezerwacji
    }
    if (this.isSlotAbsent(day)) {
      return ''; // Usuń napis "Wolne" w przypadku absencji
    }
  
    // Jeśli slot jest dostępny
    if (this.isSlotAvailable(day, time)) {
      return 'Wolne'; // Wyświetl napis "Wolne"
    }
  
    return '';
  }
  
  handleSlotClick(day: string, time: string): void {
    const date = this.getDateForDay(this.days.indexOf(day));
    const status = this.getSlotStatus(day, time);

    if (status === 'available') {
      this.router.navigate(['/reservation'], { queryParams: { date, time } });
    } else if (status === 'reserved') {
      const reservation = this.reservations.find(
        (r) => r.date === date && r.startTime === time
      );

      if (reservation) {
        const confirmCancel = confirm(
          `Czy na pewno chcesz anulować wizytę?\n\n` +
          `Typ: ${reservation.type}\n` +
          `Data: ${reservation.date}\n` +
          `Godzina: ${reservation.startTime}\n` +
          `Pacjent: ${reservation.patientName}`
        );

        if (confirmCancel) {
          this.cancelReservation(reservation);
        }
      }
    } else if (status === 'absent') {
      alert('Lekarz jest nieobecny tego dnia.');
    } else {
      alert('Ten termin nie jest dostępny.');
    }
  }

  cancelReservation(reservation: any): void {
    const dataSource = this.dataSourceManager.getDataSource();
  
    // Usunięcie danych za pomocą dynamicznego źródła
    dataSource.removeData('reservations', reservation.id).subscribe({
      next: () => {
        // Usunięcie rezerwacji z lokalnej listy (optymalizacja UI)
        this.reservations = this.reservations.filter(r => r.id !== reservation.id);
        alert('Rezerwacja została anulowana.');
      },
      error: (err) => {
        alert(`Nie udało się anulować rezerwacji: ${err.message}`);
      }
    });
  }
  

  isSlotAvailable(day: string, time: string): boolean {
    const date = this.getDateForDay(this.days.indexOf(day));

    return this.availabilities.some(
      (availability) =>
        availability.days &&
      availability.startTime <= time &&
      availability.endTime >= time &&
      new Date(availability.startDate) <= new Date(date) &&
      new Date(availability.endDate) >= new Date(date)
    );
  }

  isSlotAbsent(day: string): boolean {
    const date = this.getDateForDay(this.days.indexOf(day));
    return this.absences.some((absence) => absence.date === date);
  }

  isSlotReserved(day: string, time: string): boolean {
    const date = this.getDateForDay(this.days.indexOf(day));
    return this.reservations.some(
      (reservation) =>
        reservation.date === date && reservation.slots.includes(time)
    );
  }

  showDetails(day: string, time: string, event: MouseEvent): void {
    const date = this.getDateForDay(this.days.indexOf(day));
    const reservation = this.reservations.find(
      (r) => r.date === date && r.slots.includes(time)
    );

    if (reservation) {
      this.selectedDetails = reservation;
      this.detailsVisible = true;

      this.detailsPosition = {
        top: `${event.clientY + 10}px`,
        left: `${event.clientX + 10}px`,
      };
    }
  }

  hideDetails(): void {
    this.detailsVisible = false;
    this.selectedDetails = null;
  }
  
  

  isPastReservation(date: string, time: string): boolean {
    return new Date(`${date}T${time}`) < new Date();
  }

  getSlotTooltip(day: string, time: string): string {
    const date = this.getDateForDay(this.days.indexOf(day));
    const reservation = this.reservations.find(
      (r) => r.date === date && r.slots.includes(time)
    );
  
    if (reservation) {
      return `Typ: ${reservation.type};\nPacjent: ${reservation.patientName};\nZakres: ${reservation.slots.join(', ')}`;
    }
  
    return 'Wolny termin';
  }
  
  getConsultationColor(day: string, time: string): string {
    const date = this.getDateForDay(this.days.indexOf(day));
    const reservation = this.reservations.find(
      (r) => r.date === date && r.slots.includes(time)
    );
  
    // Jeśli jest absencja i istnieje rezerwacja, ustaw kolor na czerwony
    if (reservation && this.isSlotAbsent(day)) {
      return '#ff0000'; // Kolor czerwony dla odwołanych
    }
  
    // Jeśli jest rezerwacja, ustaw jej odpowiedni kolor
    if (reservation && reservation.type) {
      return CONSULTATION_COLORS[reservation.type] || '#cccccc';
    }
  
    return '#ffffff'; // Domyślny kolor dla wolnych slotów
  }
  

  getSlotStatus(day: string, time: string): string {
    const date = this.getDateForDay(this.days.indexOf(day));

    if (this.isSlotAbsent(day)) {
      return 'absent';
    } else if (this.isSlotReserved(day, time)) {
      return this.isPastReservation(date, time) ? 'reserved-past' : 'reserved';
    } else if (this.isSlotAvailable(day, time)) {
      return 'available';
    } else {
      return 'unavailable';
    }
  }


  getTimeDetails(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return '';
  }

  isCurrentDay(day: string): boolean {
    const today = new Date();
    const dayIndex = this.days.indexOf(day);
    const currentDate = this.getDateForDay(dayIndex);
    return currentDate === today.toISOString().split('T')[0];
  }
  
  isCurrentSlot(day: string, time: string): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes; // Convert current time to total minutes
  
    const slotStartHour = parseInt(time.split(':')[0], 10);
    const slotStartMinutes = parseInt(time.split(':')[1], 10);
    const slotStartTime = slotStartHour * 60 + slotStartMinutes;
  
    const slotEndTime = slotStartTime + 30; // Assuming each slot is 30 minutes
  
    const date = this.getDateForDay(this.days.indexOf(day));
    
    return (
      this.isCurrentDay(day) &&
      currentTime >= slotStartTime &&
      currentTime < slotEndTime
    );
  }
  
  changeViewMode(mode: 'week' | 'day'): void {
    this.viewMode = mode;
    if (mode === 'day') {
      this.selectedDayIndex = new Date().getDay() - 1; // Ustaw domyślnie na dzisiejszy dzień
    }
  }

  changeDay(offset: number): void {
    if (this.viewMode === 'day') {
      this.selectedDayIndex += offset;
      if (this.selectedDayIndex < 0) {
        this.selectedDayIndex = 6; // Wracamy do niedzieli
      } else if (this.selectedDayIndex > 6) {
        this.selectedDayIndex = 0; // Wracamy do poniedziałku
      }
    }
  }

  getSelectedDayDate(): string {
    return this.getDateForDay(this.selectedDayIndex);
  }

  

  getReservationsCountForSelectedDay(): number {
    const date = this.getSelectedDayDate();
    return this.reservations.filter(reservation => reservation.date === date).length;
  }
}




