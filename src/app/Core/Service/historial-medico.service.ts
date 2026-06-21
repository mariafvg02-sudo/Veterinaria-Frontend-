import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { HistorialMedico } from '../../Models/historial-medico.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistorialMedicoService {
  private apiUrl = `${environment.apiUrl}/historial-medico`;

  constructor(private http: HttpClient) { }

  getHistoriales(): Observable<HistorialMedico[]> {
    return this.http.get<HistorialMedico[]>(this.apiUrl);
  }

  getHistorialesPorCliente(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  getHistorialesPorMascota(mascotaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mascota/${mascotaId}`);
  }

  crearHistorial(h: HistorialMedico): Observable<HistorialMedico> {
    return this.http.post<HistorialMedico>(this.apiUrl, h).pipe(
      catchError(this.handleError)
    );
  }

  eliminarHistorial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error detallado del servidor:', error);
    return throwError(() => new Error(
      error.error?.mensaje || 'Error interno del servidor al procesar el historial.'
    ));
  }
}
