import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState,
} from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '@models/usuario.model';
import { AuthService } from '@services/auth.service';
import { LoginRequest, LoginResponse } from '@models/auth.model';
import { mapTo, mergeMap, Observable, of, tap } from 'rxjs';

export interface AuthState {
  user: Usuario | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
  })),
  withMethods((store) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();

    if (user) patchState(store, { user });

    return {
      login(req: LoginRequest, returnUrl?: string) {
        patchState(store, { loading: true });
        authService
          .login(req)
          .pipe(
            mergeMap((res: LoginResponse) => {
              authService.storeToken(res.accessToken);
              return authService.getProfile();
            })
          )
          .subscribe({
            next: (user: Usuario) => {
              authService.storeUser(user);
              patchState(store, { user, loading: false, error: null });
              router.navigate([returnUrl ?? '/']);
            },
            error: (e) => {
              patchState(store, { error: e.error.message, loading: false });
            },
            complete: () => patchState(store, { loading: false }),
          });
      },

      checkSession(): Observable<void> {
        const token = authService.getToken();
        if (!token) {
          patchState(store, { user: null, loading: false, error: null });
          return of(void 0);
        }

        patchState(store, { loading: true });
        return authService.getProfile().pipe(
          tap({
            next: (user) => {
              authService.storeUser(user);
              patchState(store, { user, loading: false, error: null });
            },
            error: () => {
              authService.logout();
              patchState(store, { user: null, loading: false, error: null });
              router.navigate(['/auth/login']);
            },
            complete: () => {
              patchState(store, { loading: false });
            },
          }),
          mapTo(void 0)
        );
      },

      logout() {
        authService.logout();
        patchState(store, { user: null, loading: false, error: null });
        router.navigate(['/auth/login']);
      },
    };
  })
);
