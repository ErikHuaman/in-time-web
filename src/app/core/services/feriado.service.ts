import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { Feriado } from '@models/feriado.model';

@Injectable({
  providedIn: 'root',
})
export class FeriadoService {
  private readonly url = `${environment.apiUrl}/feriados`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<Feriado[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: Feriado[]) => data)
    );
  }

  findOne(id: string): Observable<Feriado> {
    return this.http.get<Feriado>(`${this.url}/${id}`);
  }

  create(dto: Feriado): Observable<Feriado> {
    return this.http.post<Feriado>(`${this.url}`, dto);
  }

  update(id: string, dto: Feriado): Observable<Feriado> {
    return this.http.patch<Feriado>(`${this.url}/${id}`, dto);
  }

  findAllByMonth(fecha: Date): Observable<Feriado[]> {
    return this.http.post<Feriado[]>(`${this.url}/ByMonth`, { fecha });
  }
}
