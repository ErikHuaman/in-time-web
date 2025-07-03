import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Reemplacero } from '@models/reemplacero.model';
import { map, Observable } from 'rxjs';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class ReemplaceroService extends GenericCrudService<Reemplacero> {
  constructor(http: HttpClient) {
    super(http, 'reemplacero');
  }

  findAll(): Observable<Reemplacero[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: Reemplacero[]) => data)
    );
  }
}
