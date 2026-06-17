import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.obtenerUsuarioActual();
  // Usamos el rol normalizado guardado en el LoginComponent
  const rol = localStorage.getItem('userRole');

  // Permitir sólo si el usuario existe y su rol es 'ADMINISTRADOR'
  if (usuario && rol === 'ADMINISTRADOR') {
    return true;
  }

  // Si está autenticado pero no es administrador, redirigir al home
  if (usuario) {
    router.navigate(['/home']);
    return false;
  }

  return router.createUrlTree(['/login']);
};