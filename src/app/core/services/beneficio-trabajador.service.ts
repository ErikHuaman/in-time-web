import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { BeneficioTrabajador } from '@models/trabajador.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BeneficioTrabajadorService {
  private readonly url = `${environment.apiUrl}/beneficiosTrabajadores`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<BeneficioTrabajador[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: BeneficioTrabajador[]) => data)
    );
  }

  findOne(id: string): Observable<BeneficioTrabajador> {
    return this.http.get<BeneficioTrabajador>(`${this.url}/${id}`);
  }

  create(dto: BeneficioTrabajador): Observable<BeneficioTrabajador> {
    return this.http.post<BeneficioTrabajador>(`${this.url}`, dto);
  }

  update(
    id: string,
    dto: BeneficioTrabajador
  ): Observable<BeneficioTrabajador> {
    return this.http.put<BeneficioTrabajador>(`${this.url}/${id}`, dto);
  }
}
