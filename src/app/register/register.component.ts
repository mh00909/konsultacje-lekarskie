import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: false,
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  role: string = 'patient';

  constructor(private authService: AuthService) {}

  onRegister(): void {
    this.authService.register(this.email, this.password)
      .then(userCredential => {
        const user = userCredential.user;
        if (user) {
          this.authService.addUserToFirestore(user.uid, this.email, this.role)
            .then(() => alert('Rejestracja zakończona sukcesem!'))
            .catch(error => alert(`Błąd podczas zapisu użytkownika: ${error.message}`));
        }
      })
      .catch(error => alert(`Błąd: ${error.message}`));
  }
  
  
}
