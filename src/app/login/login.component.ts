import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        localStorage.setItem('user', JSON.stringify({ email: user.email, role: user.role }));
        alert(`Zalogowano jako ${user.role}`);

        if (user.role === 'doctor') {
          localStorage.setItem('doctorId', user.id); 
        }
        localStorage.setItem('userRole', user.role); 
        localStorage.setItem('userEmail', user.email);
        
        location.reload()
        location.replace('/home')
      },
      error: (err) => alert(`Błąd: ${err.message}`)
    });
  }
}
