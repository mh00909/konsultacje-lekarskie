// import { Component } from '@angular/core';
// import { AuthService } from '../auth.service';

// @Component({
//   selector: 'app-menu',
//   templateUrl: './menu.component.html',
//   standalone: false,
//   styleUrls: ['./menu.component.css']
// })
// export class MenuComponent {
//   currentUser: any = null;

//   constructor(private authService: AuthService) {
//     this.authService.getCurrentUser().subscribe(user => {
//       this.currentUser = user;
//     });
//   }

//   onLogout(): void {
//     this.authService.logout()
//       .then(() => alert('Wylogowano!'))
//       .catch(error => alert(`Błąd: ${error.message}`));
//   }
// }
