import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../Service/auth.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // No interceptar solicitudes que no sean HTTP
    if (!request.url.startsWith('http')) {
      return next.handle(request);
    }

    // Clonar la solicitud y agregar headers
    let clonedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      },
      withCredentials: true // Permite enviar cookies si es necesario
    });

    // Agregar token si existe
    const token = this.authService.obtenerToken();
    if (token) {
      clonedRequest = clonedRequest.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado o no autorizado
          this.authService.logout();
          console.error('Sesión expirada o no autorizado');
        }
        
        console.error('Error HTTP:', error);
        return throwError(() => error);
      })
    );
  }
}
