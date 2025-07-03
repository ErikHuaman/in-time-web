import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { LoginRequest, LoginResponse } from '@models/auth.model';
import { Usuario } from '@models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly url = `${environment.urlBase}v1/auth`;
  private readonly http = inject(HttpClient);

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, req);
  }

  getProfile() {
    return this.http.get<Usuario>(`${this.url}/profile`);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  storeUser(user: Usuario): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): Usuario | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  verificarModulo(url: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/verificarModulo`, { url });
  }
}
