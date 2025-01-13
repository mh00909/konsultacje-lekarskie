import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth.service';
import { DataSourceManagerService } from './data-source-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  userEmail: string | null = null;
  userRole: string | null = null;
  currentSource = 'json';
  showDataSourceSelector = false;

  constructor(
    private dataSourceManager: DataSourceManagerService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = localStorage.getItem('user');
    if (user) {
      this.isLoggedIn = true;
      const userData = JSON.parse(user);
      this.userEmail = userData.email;
      this.userRole = userData.role;
    }

    this.dataSourceManager.onDataSourceChange().subscribe(source => {
      this.currentSource = source;
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        this.showDataSourceSelector = url === '/login' || url === '/register';
      }
    });
  }

  onSourceChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.dataSourceManager.setDataSource(value as 'json' | 'firebase');
  }

  onLogout(): void {
    this.authService.logout().then(() => {
      localStorage.removeItem('user');
      this.isLoggedIn = false;
      this.userEmail = null;
      this.router.navigate(['/login']);
    });
  }
}
