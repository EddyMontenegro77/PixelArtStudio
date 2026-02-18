import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './components/auth/login/login';
import { Signup } from './components/auth/signup/signup';
import { Profile } from './pages/profile/profile';
import { guestGuard } from './guards/guest-guard';
import { Home } from './pages/home/home';
import { Editor } from './pages/editor/editor';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'editor', component: Editor },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'signup', component: Signup, canActivate: [guestGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
];
