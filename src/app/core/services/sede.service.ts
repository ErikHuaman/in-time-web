import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sede } from '@models/sede.model';
import { map, Observable, of } from 'rxjs';
import { GenericCrudService } from './generic/generic-crud.service';
import { environment } from '@environments/environments';

@Injectable({
  providedIn: 'root',
})
export class SedeService extends GenericCrudService<Sede> {
  constructor(http: HttpClient) {
    super(http, 'sedes');
  }

  findAll(): Observable<Sede[]> {
    return this.http.get<any>(`${environment.urlBase}v1/sedes`).pipe(
      map((data: any) => data.data),
      map((data: Sede[]) => data)
    );
  }

  daysWorked(id: string, dto: Sede): Observable<Sede> {
      return this.http.patch<Sede>(`${this.url}/daysWorked/${id}`, dto);
    }
}
