import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { TurnoTrabajo } from '@models/turno-trabajo.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TurnoTrabajoService {
  private readonly url = `${environment.urlBase}v1/turnosTrabajo`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<TurnoTrabajo[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: TurnoTrabajo[]) => data)
    );
  }
}
