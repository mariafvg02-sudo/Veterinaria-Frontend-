import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

export const jefeInventarioGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.obtenerUsuarioActual();
  const rol = localStorage.getItem('userRole');

  // Validamos contra el rol normalizado en el Login
  if (usuario && rol === 'JEFEINVENTARIO') {
    return true;
  }

  return router.createUrlTree(['/login']);
};