import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Cita } from '../../Models/cita.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CitaService {
  private apiUrl = `${environment.apiUrl}/citas`;
  readonly cupoMaximoPorHorario = 3;

  private citasCache: Cita[] | null = null;
  private readonly CACHE_TTL = 30_000;
  private cacheTimestamp = 0;

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl).pipe(
      tap(citas => {
        this.citasCache = citas;
        this.cacheTimestamp = Date.now();
      })
    );
  }

  obtenerCitasPorUsuario(usuarioId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  obtenerCitasPorVeterinario(vetId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/veterinario/${vetId}`);
  }

  obtenerCitaPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  crearCita(cita: Cita): Observable<Cita> {
    this.invalidateCache();
    return this.http.post<Cita>(`${this.apiUrl}/agendar`, cita);
  }

  actualizarCita(id: number, cita: Cita): Observable<Cita> {
    this.invalidateCache();
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, cita);
  }

  cancelarCita(id: number): Observable<void> {
    this.invalidateCache();
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validarCupoHorario(fecha: string, hora: string): Observable<{ disponible: boolean; ocupados: number; cupoMaximo: number }> {
    const fechaDia = this.extraerFecha(fecha);
    const horaObjetivo = this.extraerHora(fecha, hora);

    const source$ = this.isCacheValid()
      ? of(this.citasCache!)
      : this.obtenerTodas();

    return source$.pipe(
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

  private isCacheValid(): boolean {
    return this.citasCache !== null && (Date.now() - this.cacheTimestamp) < this.CACHE_TTL;
  }

  private invalidateCache(): void {
    this.citasCache = null;
    this.cacheTimestamp = 0;
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
