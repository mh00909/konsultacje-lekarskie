import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-doctor-panel',
  templateUrl: './doctor-panel.component.html',
  styleUrls: ['./doctor-panel.component.css']
})
export class DoctorPanelComponent implements OnInit {
  doctorId: string | null = null;

  ngOnInit(): void {
    this.doctorId = localStorage.getItem('doctorId'); 
    if (!this.doctorId) {
      alert('Brak doctorId. Upewnij się, że jesteś zalogowany jako lekarz.');
    }
  }
}
