import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../Core/Service/auth.service';

export const veterinarioGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.obtenerUsuarioActual();

  if (usuario && usuario.rol === 'VETERINARIO') {
    return true;
  }

  return router.createUrlTree(['/login']);
};