import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { Dispositivo } from '@models/dispositivo.model';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class DispositivoService extends GenericCrudService<Dispositivo> {
  constructor(http: HttpClient) {
    super(http, 'dispositivos');
  }
}
