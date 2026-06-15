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

  // Este método envía los datos al backend para persistirlos
  crearHistorial(h: HistorialMedico): Observable<HistorialMedico> {
    console.log('Datos enviados al backend:', JSON.stringify(h, null, 2));
    return this.http.post<HistorialMedico>(this.apiUrl, h).pipe(
      catchError(this.handleError)
    );
  }

  eliminarHistorial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    // Imprimimos el error completo en consola para depurar
    console.error('Error detallado del servidor:', error);
    return throwError(() => new Error(
      error.error?.mensaje || 'Error interno del servidor al procesar el historial.'
    ));
  }
}