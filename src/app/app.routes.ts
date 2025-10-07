import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Dash } from './pages/dash/dash';
import { Calendar } from './pages/calendar/calendar';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    component: Home,
  },
  {
    path: 'dash',
    title: 'Dash',
    component: Dash,
  },
  {
    path: 'calendar',
    title: 'Calendar',
    component: Calendar,
  },
  {
    path: 'register',
    title: 'Register',
    component: Register,
  },
  {
    path: 'profile',
    title: 'Profile',
    component: Profile,
  },
];
