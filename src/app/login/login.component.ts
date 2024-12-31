import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  onLogin(): void {
    this.authService.login(this.email, this.password)
      .then(userCredential => {
        const user = userCredential.user;
        if (user) {
          this.authService.getUserRole(user.uid).subscribe({
            next: (data) => {
              if (data && data.role) {
                localStorage.setItem('user', JSON.stringify({ email: user.email, role: data.role }));
                alert(`Zalogowano jako ${data.role}`);
              } else {
                alert('Brak przypisanej roli użytkownika.');
              }
            },
            error: (err) => {
              alert(`Błąd odczytu roli użytkownika: ${err.message}`);
            }
          });
        }
      })
      .catch(error => alert(`Błąd: ${error.message}`));
  }
  
  
}
