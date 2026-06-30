import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Login } from '../../Models/login.model';
import { Register } from '../../Models/register.model';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id?: number;
  userId?: number;
  nombre?: string;
  documentoIdentidad: number;
  correo: string;
  clave?: string;
  telefono?: string;
  rol?: 'ADMINISTRADOR' | 'VETERINARIO' | 'RECEPCIONISTA' | 'JEFE_INVENTARIO' | 'JEFEINVENTARIO' | 'CLIENTE';
  activo?: boolean;
}

export interface LoginResponse {
  token?: string;
  usuario?: Usuario;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private usersUrl = `${environment.apiUrl}/users`;
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuarioGuardado();
  }

  private cargarUsuarioGuardado(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioSubject.next(JSON.parse(usuarioGuardado));
    }
  }

  register(usuario: Register): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, usuario).pipe(
      tap((response) => {
        if (response.usuario) {
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          this.usuarioSubject.next(response.usuario);
        }
      })
    );
  }

  adminCrearUsuario(usuario: Register): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, usuario);
  }

  login(correo: string, clave: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, clave }).pipe(
      tap((response) => {
        if (response.usuario) {
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          this.usuarioSubject.next(response.usuario);
        }
      })
    );
  }

  forgotPassword(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { correo }, { responseType: 'text' });
  }

  verifyCode(correo: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-code`, { correo, code }, { responseType: 'text' });
  }

  resetPassword(correo: string, code: string, nuevaClave: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { correo, code, nuevaClave }, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.usuarioSubject.next(null);
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerUsuarioActual();
  }

  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.usersUrl);
  }

  actualizarUsuario(id: number, datos: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.usersUrl}/${id}`, datos);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }
}
