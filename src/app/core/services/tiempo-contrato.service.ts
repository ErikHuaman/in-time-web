import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { TiempoContrato } from '@models/tiempo-contrato.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TiempoContratoService {
  private readonly url = `${environment.apiUrl}/tiempoContrato`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<TiempoContrato[]> {
    return this.http.get<TiempoContrato[]>(this.url);
  }
}
