import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JustificacionInasistencia } from '@models/justificacion-inasistencia.model';
import { map, Observable } from 'rxjs';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class JustificacionInasistenciaService extends GenericCrudService<JustificacionInasistencia> {
  constructor(http: HttpClient) {
    super(http, 'justificacionInasistencia');
  }

  findAll(): Observable<JustificacionInasistencia[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: JustificacionInasistencia[]) => data)
    );
  }
}
