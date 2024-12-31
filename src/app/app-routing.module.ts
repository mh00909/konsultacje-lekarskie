import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { AvailabilityComponent } from './availability/availability.component';
import { AbsenceComponent } from './absence/absence.component';
import { CartComponent } from './cart/cart.component';
import { ReservationComponent } from './reservation/reservation.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
 // { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
 { path: 'calendar', component: CalendarComponent}, 
 { path: 'availability', component: AvailabilityComponent },
  { path: 'absence', component: AbsenceComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: 'cart', component: CartComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: '**', redirectTo: '/calendar' },

];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
