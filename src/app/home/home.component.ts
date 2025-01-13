import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'Witamy w systemie rezerwacji wizyt!';
  userRole: string | null = null;

  ngOnInit(): void {
    this.userRole = localStorage.getItem('userRole');
    console.log('Rola użytkownika:', this.userRole);
  }

  getWelcomeMessage(): string {
    switch (this.userRole) {
      case 'doctor':
        return 'Zarządzaj swoim harmonogramem i dostępnościami.';
      case 'patient':
        return 'Zarezerwuj wizytę u swojego lekarza.';
      default:
        return 'Zaloguj się, aby uzyskać dostęp do systemu.';
    }
  }
}
