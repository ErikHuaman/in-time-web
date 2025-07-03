import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermisoTrabajador } from '@models/permiso-trabajador.model';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class PermisoTrabajadorService extends GenericCrudService<PermisoTrabajador> {
  constructor(http: HttpClient) {
    super(http, 'permisosTrabajador');
  }
}
