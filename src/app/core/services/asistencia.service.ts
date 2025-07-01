import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';
import { Asistencia } from '@models/asistencia.model';

@Injectable({
  providedIn: 'root',
})
export class AsistenciaService {
  private readonly url = `${environment.apiUrl}/asistencias`;

  private readonly http = inject(HttpClient);

  findAllByMonth(fecha: Date): Observable<{ asistencia: any[]; cards: any }> {
    return this.http.post<{ asistencia: any[]; cards: any }>(
      `${this.url}/ByMonth`,
      { fecha }
    );
  }

  findAllObservadoByMonth(fecha: Date): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}/ObservadoByMonth`, { fecha });
  }

  findAllInasistenciaByMonth(fecha: Date): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}/InasistenciaByMonth`, { fecha });
  }

  findAllBySupervisorAndDate(fecha: Date): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}/BySupervisorAndDate`, { fecha });
  }

  create(dto: Asistencia): Observable<Asistencia> {
    return this.http.post<Asistencia>(`${this.url}`, dto);
  }

  update(id: string, dto: Asistencia): Observable<Asistencia> {
    return this.http.patch<Asistencia>(`${this.url}/${id}`, dto);
  }

  changeStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.get<any>(`${this.url}/changeStatus/${id}/${isActive}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
