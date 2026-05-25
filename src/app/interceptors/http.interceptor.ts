import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../Core/Service/auth.service';

export const httpInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  // No interceptar solicitudes que no sean HTTP
  if (!request.url.startsWith('http')) {
    return next(request);
  }

  // Clonar la solicitud y agregar headers
  let clonedRequest = request.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    },
    withCredentials: true // Permite enviar cookies si es necesario
  });

  // Agregar token si existe
  const token = authService.obtenerToken();
  if (token) {
    clonedRequest = clonedRequest.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o no autorizado
        authService.logout();
        console.error('Sesión expirada o no autorizado');
      }
      
      console.error('Error HTTP:', error);
      return throwError(() => error);
    })
  );
};
