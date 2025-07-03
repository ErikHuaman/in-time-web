import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cargo } from '@models/cargo.model';
import { map, Observable, of } from 'rxjs';
import { GenericCrudService } from './generic/generic-crud.service';
import { environment } from '@environments/environments';

@Injectable({
  providedIn: 'root',
})
export class CargoService extends GenericCrudService<Cargo> {
  constructor(http: HttpClient) {
    super(http, 'cargos');
  }

  findAll(): Observable<Cargo[]> {
    return this.http.get<any>(`${environment.urlBase}v1/cargos`).pipe(
      map((data: any) => data.data),
      map((data: Cargo[]) => data)
    );
  }
}
