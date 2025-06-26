import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { Parametro } from '@models/parametro.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
  private readonly url = `${environment.apiUrl}/parametro`;

  private readonly http = inject(HttpClient);

  findFirst(): Observable<Parametro> {
    return this.http.get<Parametro>(`${this.url}`);
  }

  create(dto: Parametro): Observable<Parametro> {
    return this.http.post<Parametro>(`${this.url}`, dto);
  }

  update(id: string, dto: Parametro): Observable<Parametro> {
    return this.http.put<Parametro>(`${this.url}/${id}`, dto);
  }
}
