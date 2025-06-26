import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';
import { BloqueHoras } from '@models/bloque-horas.model';

@Injectable({
  providedIn: 'root',
})
export class BloqueHorasService {
  private readonly url = `${environment.apiUrl}/bloqueHoras`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<BloqueHoras[]> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => data.data),
      map((data: BloqueHoras[]) => data)
    );
  }

  findOne(id: string): Observable<BloqueHoras> {
    return this.http.get<BloqueHoras>(`${this.url}/${id}`);
  }

  create(dto: BloqueHoras): Observable<BloqueHoras> {
    return this.http.post<BloqueHoras>(`${this.url}`, dto);
  }

  update(id: string, dto: BloqueHoras): Observable<BloqueHoras> {
    return this.http.put<BloqueHoras>(`${this.url}/${id}`, dto);
  }
}
