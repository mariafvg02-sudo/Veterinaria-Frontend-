import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private apiUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  listarFacturas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCitaId(citaId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cita/${citaId}`);
  }

  crearFactura(factura: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, factura);
  }

  actualizarFactura(id: number, factura: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, factura);
  }

  descargarFacturaPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
