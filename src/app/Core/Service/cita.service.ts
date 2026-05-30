import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita } from '../../Models/cita.model';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private apiUrl = 'http://localhost:8080/api/citas';
  readonly cupoMaximoPorHorario = 3;

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  obtenerCitasPorUsuario(usuarioId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }


  obtenerCitaPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  crearCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  actualizarCita(id: number, cita: Cita): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, cita);
  }

  cancelarCita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validarCupoHorario(fecha: string, hora: string): Observable<{ disponible: boolean; ocupados: number; cupoMaximo: number }> {
    const fechaDia = this.extraerFecha(fecha);
    const horaObjetivo = this.extraerHora(fecha, hora);

    return this.obtenerTodas().pipe(
      map((citas) => {
        const ocupados = citas.filter((cita) => {
          const mismaFecha = this.extraerFecha(cita.fecha) === fechaDia;
          const mismaHora = this.extraerHora(cita.fecha) === horaObjetivo;
          const activa = (cita.estado || '').toLowerCase() !== 'cancelada';
          return mismaFecha && mismaHora && activa;
        }).length;

        return {
          disponible: ocupados < this.cupoMaximoPorHorario,
          ocupados,
          cupoMaximo: this.cupoMaximoPorHorario
        };
      })
    );
  }

  private extraerFecha(fecha: string): string {
    return (fecha || '').split('T')[0];
  }

  private extraerHora(fecha: string, horaFallback?: string): string {
    if (horaFallback) {
      return horaFallback;
    }

    const partes = (fecha || '').split('T');
    return partes[1] ? partes[1].substring(0, 5) : '';
  }
}
