import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GrupoModulo } from '@models/grupo-modulo.model';
import { Rol } from '@models/rol.model';
import { Observable } from 'rxjs';
import { GenericCrudService } from './generic/generic-crud.service';
import { environment } from '@environments/environments';

@Injectable({
  providedIn: 'root',
})
export class RolService extends GenericCrudService<Rol> {
  constructor(http: HttpClient) {
    super(http, 'roles');
  }

  findAllModulesByIdRol(idRol: string): Observable<GrupoModulo[]> {
    return this.http.get<GrupoModulo[]>(
      `${environment.urlBase}v1/roles/findAllModulesByIdRol/${idRol}`
    );
  }
}
