import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { InfoTrabajador } from '@models/trabajador.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoTrabajadorService {
  private readonly url = `${environment.apiUrl}/infoTrabajadores`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<InfoTrabajador[]> {
    return this.http.get<InfoTrabajador[]>(this.url);
  }

  findOne(id: string): Observable<InfoTrabajador> {
    return this.http.get<InfoTrabajador>(`${this.url}/${id}`);
  }

  create(dto: InfoTrabajador): Observable<InfoTrabajador> {
    console.log('Creating InfoTrabajador:', dto);
    return this.http.post<InfoTrabajador>(`${this.url}`, dto);
  }

  update(id: string, dto: InfoTrabajador): Observable<InfoTrabajador> {
    return this.http.put<InfoTrabajador>(`${this.url}/${id}`, dto);
  }
}
