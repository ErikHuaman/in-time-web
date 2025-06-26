import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { ControlTrabajador } from '@models/trabajador.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ControlTrabajadorService {
  private readonly url = `${environment.apiUrl}/controlesTrabajadores`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<ControlTrabajador[]> {
    return this.http.get<ControlTrabajador[]>(this.url);
  }

  findOne(id: string): Observable<ControlTrabajador> {
    return this.http.get<ControlTrabajador>(`${this.url}/${id}`);
  }

  create(dto: ControlTrabajador): Observable<ControlTrabajador> {
    return this.http.post<ControlTrabajador>(`${this.url}`, dto);
  }

  update(id: string, dto: ControlTrabajador): Observable<ControlTrabajador> {
    return this.http.put<ControlTrabajador>(`${this.url}/${id}`, dto);
  }
}
