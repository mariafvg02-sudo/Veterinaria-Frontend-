import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistorialMedico } from '../Models/historial-medico.model';

@Injectable({
  providedIn: 'root'
})
export class HistorialMedicoService {
  // Asegúrate de que este puerto coincida con tu Server de Spring Boot
  private apiUrl = 'http://localhost:8080/api/historiales'; 

  constructor(private http: HttpClient) { }

  getHistoriales(): Observable<HistorialMedico[]> {
    return this.http.get<HistorialMedico[]>(this.apiUrl);
  }

  // Este método envía los datos al backend para persistirlos
  crearHistorial(h: HistorialMedico): Observable<HistorialMedico> {
    return this.http.post<HistorialMedico>(this.apiUrl, h);
  }

  eliminarHistorial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}