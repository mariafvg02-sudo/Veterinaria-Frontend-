import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Veterinario } from '../../Models/veterinario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VeterinarioService {
  private url = `${environment.apiUrl}/veterinarios`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Veterinario[]> {
    return this.http.get<Veterinario[]>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  obtenerPorId(id: number): Observable<Veterinario> {
    return this.http.get<Veterinario>(`${this.url}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  guardar(veterinario: Veterinario): Observable<Veterinario> {
    return this.http.post<Veterinario>(this.url, veterinario).pipe(
      catchError(this.handleError)
    );
  }

  actualizar(id: number, veterinario: Veterinario): Observable<Veterinario> {
    return this.http.put<Veterinario>(`${this.url}/${id}`, veterinario).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en VeterinarioService:', error);
    return throwError(() => new Error(
      error.error?.mensaje || 'Error en el servidor al gestionar veterinarios.'
    ));
  }
}