import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GenericCrudService } from './generic/generic-crud.service';
import { TipoPatron } from '@models/tipo-patron.model';

@Injectable({
  providedIn: 'root',
})
export class TipoPatronService extends GenericCrudService<TipoPatron> {
  constructor(http: HttpClient) {
    super(http, 'tipoPatrones');
  }
}
