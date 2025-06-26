import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { InactivacionTrabajador } from '@models/inactivacionTrabajador.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InactivacionService {
  private readonly url = `${environment.apiUrl}/inactivacionTrabajadores`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<InactivacionTrabajador[]> {
    return this.http.get<InactivacionTrabajador[]>(this.url);
  }

  findOne(id: string): Observable<InactivacionTrabajador> {
    return this.http.get<InactivacionTrabajador>(`${this.url}/${id}`);
  }

  create(dto: InactivacionTrabajador): Observable<InactivacionTrabajador> {
    return this.http.post<InactivacionTrabajador>(`${this.url}`, dto);
  }

  update(id: string, dto: InactivacionTrabajador): Observable<InactivacionTrabajador> {
    return this.http.put<InactivacionTrabajador>(`${this.url}/${id}`, dto);
  }
}
