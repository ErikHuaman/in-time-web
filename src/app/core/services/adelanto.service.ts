import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { Adelanto } from '@models/adelanto.model';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class AdelantoService extends GenericCrudService<Adelanto> {
  constructor(http: HttpClient) {
    super(http, 'adelantos');
  }
}
