import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../Service/auth.service';

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.obtenerUsuarioActual();

  console.log('Verificando acceso para:', usuario);

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