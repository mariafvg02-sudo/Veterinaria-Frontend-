import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Veterinario } from '../../Models/veterinario.model';

@Injectable({ providedIn: 'root' })
export class VeterinarioService {
  private url = '/api/veterinarios'; // Ajusta tu puerto

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Veterinario[]> {
    return this.http.get<Veterinario[]>(this.url);
  }
  // Agregar este método en tu servicio de Angular
  obtenerPorId(id: number): Observable<Veterinario> {
    return this.http.get<Veterinario>(`${this.url}/${id}`);
  }
  guardar(veterinario: Veterinario): Observable<Veterinario> {
    return this.http.post<Veterinario>(this.url, veterinario);
  }

  actualizar(id: number, veterinario: Veterinario): Observable<Veterinario> {
    return this.http.put<Veterinario>(`${this.url}/${id}`, veterinario);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}