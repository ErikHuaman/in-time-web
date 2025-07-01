import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { toFormData } from '@functions/formData.function';
import { CorreccionMarcacion } from '@models/correccion-marcacion.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CorreccionMarcacionService {
  private readonly url = `${environment.apiUrl}/correccionMarcacion`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<CorreccionMarcacion[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: CorreccionMarcacion[]) => data)
    );
  }

  findOne(id: string): Observable<CorreccionMarcacion> {
    return this.http.get<CorreccionMarcacion>(`${this.url}/${id}`);
  }

  create(dto: CorreccionMarcacion): Observable<CorreccionMarcacion> {
    return this.http.post<CorreccionMarcacion>(`${this.url}`, dto);
  }

  update(
    id: string,
    dto: CorreccionMarcacion
  ): Observable<CorreccionMarcacion> {
    return this.http.patch<CorreccionMarcacion>(`${this.url}/${id}`, dto);
  }
}
