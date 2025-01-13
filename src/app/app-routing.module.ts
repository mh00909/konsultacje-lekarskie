import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { AvailabilityComponent } from './availability/availability.component';
import { AbsenceComponent } from './absence/absence.component';
import { CartComponent } from './cart/cart.component';
import { ReservationComponent } from './reservation/reservation.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { DoctorListComponent } from './doctor-list/doctor-list.component';
import { HomeComponent } from './home/home.component';
import { UsersListComponent } from './users-list/users-list.component';

const routes: Routes = [
  { path: 'calendar/:doctorId', component: CalendarComponent, canActivate: [AuthGuard], data: { roles: ['patient', 'doctor', 'admin'] } },
  //{ path: 'calendar', component: CalendarComponent },
  { path: 'availability', component: AvailabilityComponent, canActivate: [AuthGuard], data: { roles: ['doctor'] } },
  { path: 'absence', component: AbsenceComponent, canActivate: [AuthGuard], data: { roles: ['doctor'] } },
  { path: 'reservation', component: ReservationComponent, canActivate: [AuthGuard], data: { roles: ['patient'] }},
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard], data: { roles: ['patient'] } },
  { path: 'register', component: RegisterComponent},
  { path: 'login', component: LoginComponent },
  { path: 'doctors', component: DoctorListComponent },
  { path: 'home', component: HomeComponent},
  { path: 'users', component: UsersListComponent },
  { path: 'unauthorized', component: UnauthorizedComponent }, 
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: '**', redirectTo: '/calendar' },
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
