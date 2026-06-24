import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private apiUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) {}

  listarPagos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearPago(pago: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, pago);
  }

  anularPago(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/anular`, {});
  }
}
