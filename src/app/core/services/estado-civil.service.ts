import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { EstadoCivil } from '@models/estado-civil.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EstadoCivilService {
  private readonly url = `${environment.urlBase}v1/estadosCiviles`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<EstadoCivil[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: EstadoCivil[]) => data)
    );
  }
}
