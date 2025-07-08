import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorarioTrabajador } from '@models/horario-trabajador.model';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class HorarioTrabajadorService extends GenericCrudService<HorarioTrabajador> {
  constructor(http: HttpClient) {
    super(http, 'horarioTrabajadores');
  }
}
