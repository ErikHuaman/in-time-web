import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { FrecuenciaPago } from '@models/frecuencia-pago.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FrecuenciaPagoService {
  private readonly url = `${environment.apiUrl}/frecuenciaPago`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<FrecuenciaPago[]> {
    return this.http.get<FrecuenciaPago[]>(this.url);
  }
}
