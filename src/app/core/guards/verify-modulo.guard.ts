import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { catchError, map, of } from 'rxjs';

export const verifyModuloGuard: CanActivateChildFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (state.url.startsWith('/ajustes/usuarios') || state.url === '/') {
    return of(true);
  }

  return authService.verificarModulo(state.url).pipe(
    map((isAuthorized: boolean) => {
      if (!isAuthorized) {
        router.navigate(['/']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
