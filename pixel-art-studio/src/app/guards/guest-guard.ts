import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.waitForAuthInitialization();
  const hasSession = await authService.hasActiveSession();

  return hasSession ? router.createUrlTree(['/profile']) : true;
};
