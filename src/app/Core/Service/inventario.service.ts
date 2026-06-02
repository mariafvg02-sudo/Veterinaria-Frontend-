import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventarioProducto } from '../../Models/inventario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/inventario`;

  constructor(private http: HttpClient) {}

  listar(): Observable<InventarioProducto[]> {
    return this.http.get<InventarioProducto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<InventarioProducto> {
    return this.http.get<InventarioProducto>(`${this.apiUrl}/${id}`);
  }

  crear(producto: InventarioProducto): Observable<InventarioProducto> {
    return this.http.post<InventarioProducto>(this.apiUrl, producto);
  }

  actualizar(id: number, producto: InventarioProducto): Observable<InventarioProducto> {
    return this.http.put<InventarioProducto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
