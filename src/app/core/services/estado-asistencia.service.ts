import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { EstadoAsistencia } from '@models/estado-asistencia.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoAsistenciaService {
  private readonly url = `${environment.apiUrl}/estadoAsistencias`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<EstadoAsistencia[]> {
    return this.http.get<EstadoAsistencia[]>(this.url);
  }
}
