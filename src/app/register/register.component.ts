import { Component } from '@angular/core';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  role: string = 'patient';

  constructor(private authService: AuthService) {}

  onRegister(): void {
    this.authService.register(this.email, this.password, this.role).subscribe({
      next: () => {
        alert('Rejestracja zakończona sukcesem!');
        location.replace('/login');
      },
      error: (err) => alert(`Błąd podczas rejestracji: ${err.message}`)
    });
  }
  
}
