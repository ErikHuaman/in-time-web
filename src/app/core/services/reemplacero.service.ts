import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { toFormData } from '@functions/formData.function';
import { Reemplacero } from '@models/reemplacero.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReemplaceroService {
  private readonly url = `${environment.apiUrl}/reemplacero`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<Reemplacero[]> {
    return this.http.get<Reemplacero[]>(this.url);
  }

  obtenerArchivo(id: string): Observable<Blob> {
    return this.http.get(`${this.url}/obtenerArchivo/${id}`, {
      responseType: 'blob', // Importante: Indicar que la respuesta es un Blob
    });
  }

  create(dto: Reemplacero): Observable<Reemplacero> {
    const formData: FormData = toFormData(dto);
    return this.http.post<Reemplacero>(`${this.url}`, formData);
  }

  update(id: string, dto: Reemplacero): Observable<Reemplacero> {
    const formData: FormData = toFormData(dto);
    return this.http.put<Reemplacero>(`${this.url}/${id}`, formData);
  }
}
