import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { PermisoTrabajador } from '@models/permiso-trabajador.model';
import { toFormData } from '@functions/formData.function';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class PermisoTrabajadorService extends GenericCrudService<PermisoTrabajador> {
  constructor(http: HttpClient) {
    super(http, 'permisosTrabajador');
  }
}
