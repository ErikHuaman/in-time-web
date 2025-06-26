import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ContratoTrabajador } from '@models/trabajador.model';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class ContratoTrabajadorService extends GenericCrudService<ContratoTrabajador> {
  constructor(http: HttpClient) {
    super(http, 'contratosTrabajadores');
  }
}
