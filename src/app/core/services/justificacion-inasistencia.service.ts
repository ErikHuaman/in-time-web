import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { toFormData } from '@functions/formData.function';
import { JustificacionInasistencia } from '@models/justificacion-inasistencia.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JustificacionInasistenciaService {
  private readonly url = `${environment.apiUrl}/justificacionInasistencia`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<JustificacionInasistencia[]> {
    return this.http.get<JustificacionInasistencia[]>(this.url);
  }

  findOne(id: string): Observable<JustificacionInasistencia> {
    return this.http.get<JustificacionInasistencia>(`${this.url}/${id}`);
  }

  create(
    dto: JustificacionInasistencia
  ): Observable<JustificacionInasistencia> {
    const formData: FormData = toFormData(dto);
    return this.http.post<JustificacionInasistencia>(`${this.url}`, formData);
  }

  update(
    id: string,
    dto: JustificacionInasistencia
  ): Observable<JustificacionInasistencia> {
    return this.http.put<JustificacionInasistencia>(`${this.url}/${id}`, dto);
  }
}
