import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard para proteger rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige al login SAML
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user) {
        // Usuario autenticado, permitir acceso
        return true;
      } else {
        // Usuario no autenticado, redirigir al login SAML
        console.warn('Usuario no autenticado, redirigiendo al login SAML');
        authService.loginWithSAML();
        return false;
      }
    })
  );
};
