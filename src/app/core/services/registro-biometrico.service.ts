import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';
import { RegistroBiometrico } from '@models/registro-biometrico.model';
import { toFormData } from '@functions/formData.function';

@Injectable({
  providedIn: 'root',
})
export class RegistroBiometricoService {
  private readonly url = `${environment.apiUrl}/registrosBiometricos`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<RegistroBiometrico[]> {
    return this.http.get<RegistroBiometrico[]>(this.url);
  }

  obtenerArchivo(id: string): Observable<Blob> {
    return this.http.get(`${this.url}/obtenerArchivo/${id}`, {
      responseType: 'blob', // Importante: Indicar que la respuesta es un Blob
    });
  }

  create(dto: RegistroBiometrico): Observable<RegistroBiometrico> {
    const formData: FormData = toFormData(dto);
    return this.http.post<RegistroBiometrico>(`${this.url}`, formData);
  }

  update(id: string, dto: RegistroBiometrico): Observable<RegistroBiometrico> {
    const formData: FormData = toFormData(dto);
    return this.http.put<RegistroBiometrico>(`${this.url}/${id}`, formData);
  }
}
