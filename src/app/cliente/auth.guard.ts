import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../Core/Service/auth.service';

export const clienteGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.obtenerUsuarioActual();

  // Si hay usuario y su rol es cliente, permitir acceso
  if (usuario && usuario.rol?.toLowerCase() === 'cliente') {
    return true;
  }

  // Si hay usuario autenticado pero no es cliente, rechazar
  if (usuario) {
    console.warn('Usuario autenticado pero no es cliente. Rol:', usuario.rol);
    router.navigate(['/home']);
    return false;
  }

  // Si no hay usuario, ir a login
  router.navigate(['/login']);
  return false;
};