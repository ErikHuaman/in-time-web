import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { TipoTurno } from '@models/tipo-turno.model';

@Injectable({
  providedIn: 'root',
})
export class TipoTurnoService {
  private readonly url = `${environment.urlBase}v1/tipoTurnos`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<TipoTurno[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: TipoTurno[]) => data)
    );
  }
}
