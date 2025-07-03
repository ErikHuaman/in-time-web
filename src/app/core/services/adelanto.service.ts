import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
