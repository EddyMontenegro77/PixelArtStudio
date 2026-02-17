import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { Login } from './components/auth/login/login';
import { Signup } from './components/auth/signup/signup';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [AuthGuard] },
  { path: 'signup', component: Signup, canActivate: [AuthGuard] },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
];
