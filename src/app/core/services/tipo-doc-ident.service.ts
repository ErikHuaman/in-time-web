import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { TipoDocIdent } from '@models/tipo-doc-ident.model';
import { Observable } from 'rxjs';
import { GenericCrudService } from './generic/generic-crud.service';

@Injectable({
  providedIn: 'root',
})
export class TipoDocIdentService extends GenericCrudService<TipoDocIdent> {
  constructor(http: HttpClient) {
    super(http, 'tipoDocIdentificacion');
  }
}
