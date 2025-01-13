import { Component, OnInit } from '@angular/core';
import { DataSourceManagerService } from '../data-source-manager.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: any[] = [];
  isLoading = false;

  constructor(private dataSourceManager: DataSourceManagerService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading = true;
    const dataSource = this.dataSourceManager.getDataSource();
    dataSource.getData('users').subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania użytkowników:', err);
        this.isLoading = false;
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      const dataSource = this.dataSourceManager.getDataSource();
      dataSource.removeData('users', userId).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== userId);
          alert('Użytkownik został usunięty.');
        },
        error: (err) => {
          alert(`Błąd podczas usuwania użytkownika: ${err.message}`);
        }
      });
    }
  }
}
