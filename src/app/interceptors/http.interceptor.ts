import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../Core/Service/auth.service';

export const httpInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  if (!request.url.startsWith('http')) {
    return next(request);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const token = authService.obtenerToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const clonedRequest = request.clone({
    setHeaders: headers,
    withCredentials: true
  });

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
