import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './Core/Service/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.obtenerUsuarioActual();

  // Permitir sólo si el usuario existe y su rol es 'administrador'
  if (usuario && usuario.rol?.toLowerCase() === 'administrador') {
    return true;
  }

  // Si está autenticado pero no es admin, redirigir a home
  if (usuario) {
    router.navigate(['/home']);
    return false;
  }

  // Si no está autenticado, ir a login
  router.navigate(['/login']);
  return false;
};
