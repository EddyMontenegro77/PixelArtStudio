import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Login } from './components/auth/login/login';
import { Signup } from './components/auth/signup/signup';
import { Profile } from './pages/profile/profile';
import { guestGuard } from './guards/guest-guard';
import { Home } from './pages/home/home';
import { Editor } from './pages/editor/editor';
import { ResetPassword } from './components/auth/reset-password/reset-password';
import { recoveryGuard } from './guards/recovery-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'editor', component: Editor, data: { hideAppHeader: true } },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'signup', component: Signup, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPassword, canActivate: [recoveryGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
];
