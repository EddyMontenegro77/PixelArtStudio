import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const recoveryGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const typeQuery = route.queryParamMap.get('type');
  const hasRecoveryType = typeQuery === 'recovery';
  const hasQueryTokens =
    route.queryParamMap.has('token') ||
    route.queryParamMap.has('token_hash') ||
    route.queryParamMap.has('code');

  const fragment = (route.fragment ?? '').toLowerCase();
  const hasFragmentTokens =
    fragment.includes('type=recovery') ||
    fragment.includes('access_token=') ||
    fragment.includes('refresh_token=');

  const isRecoveryFlow = hasRecoveryType || hasQueryTokens || hasFragmentTokens;

  return isRecoveryFlow ? true : router.createUrlTree(['/login']);
};
