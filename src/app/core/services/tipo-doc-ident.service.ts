import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TipoDocIdent } from '@models/tipo-doc-ident.model';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class TipoDocIdentService extends GenericCrudService<TipoDocIdent> {
  constructor(http: HttpClient) {
    super(http, 'tipoDocIdentificacion');
  }
}
