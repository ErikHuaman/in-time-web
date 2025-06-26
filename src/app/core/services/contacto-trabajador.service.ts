import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environments';
import { ContactoTrabajador } from '@models/trabajador.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactoTrabajadorService {
  private readonly url = `${environment.apiUrl}/contactosTrabajadores`;

  private readonly http = inject(HttpClient);

  findAll(): Observable<ContactoTrabajador[]> {
    return this.http.get<ContactoTrabajador[]>(this.url);
  }

  findOne(id: string): Observable<ContactoTrabajador> {
    return this.http.get<ContactoTrabajador>(`${this.url}/${id}`);
  }

  create(dto: ContactoTrabajador): Observable<ContactoTrabajador> {
    return this.http.post<ContactoTrabajador>(`${this.url}`, dto);
  }

  update(
    id: string,
    dto: ContactoTrabajador
  ): Observable<ContactoTrabajador> {
    return this.http.put<ContactoTrabajador>(`${this.url}/${id}`, dto);
  }
}
