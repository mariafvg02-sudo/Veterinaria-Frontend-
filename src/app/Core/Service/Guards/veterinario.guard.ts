import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

export const veterinarioGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.obtenerUsuarioActual();
  const rol = localStorage.getItem('userRole');

  if (usuario && rol === 'VETERINARIO') {
    return true;
  }

  return router.createUrlTree(['/login']);
};