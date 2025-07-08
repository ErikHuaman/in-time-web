import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { Feriado } from '@models/feriado.model';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class FeriadoService extends GenericCrudService<Feriado> {
  constructor(http: HttpClient) {
    super(http, 'feriados');
  }

  findAll(): Observable<Feriado[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: Feriado[]) => data)
    );
  }

  findAllByMonth(fecha: Date): Observable<Feriado[]> {
    return this.http.post<Feriado[]>(`${this.url}/ByMonth`, { fecha });
  }
}
